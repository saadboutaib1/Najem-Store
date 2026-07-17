<?php

namespace App\Services;

use App\Models\CustomerLoyaltyPoint;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/[^\d]/', '', $phone) ?? '';

        if (str_starts_with($digits, '00')) {
            return substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '0')) {
            return '212'.substr($digits, 1);
        }

        if (strlen($digits) === 9 && !str_starts_with($digits, '212')) {
            return '212'.$digits;
        }

        return $digits;
    }

    public function pointsForAmount(float $amount): int
    {
        if (!$this->isEnabled()) {
            return 0;
        }

        $amountPerPoint = max(1, $this->settings->getFloat('loyalty_amount_per_point', 10));

        return max(0, (int) floor($amount / $amountPerPoint));
    }

    public function syncOrderStatus(Order $order, string $previousStatus): void
    {
        if ($order->status === 'delivered' && $previousStatus !== 'delivered') {
            $this->awardOrder($order);
            return;
        }

        if ($previousStatus === 'delivered' && $order->status !== 'delivered') {
            $this->removeOrderAward($order);
        }
    }

    public function lookup(string $phone): array
    {
        $normalizedPhone = $this->normalizePhone($phone);
        $record = CustomerLoyaltyPoint::query()->where('phone', $normalizedPhone)->first();
        $totalPoints = (int) ($record?->total_points ?? 0);
        $rewardPoints = max(1, (int) $this->settings->get('loyalty_reward_points', 100));
        $rewardValue = $this->settings->getFloat('loyalty_reward_value', 20);
        $availableRewards = intdiv($totalPoints, $rewardPoints);
        $pointsRemainder = $totalPoints % $rewardPoints;

        return [
            'phone' => $normalizedPhone,
            'total_points' => $totalPoints,
            'total_orders' => (int) ($record?->total_orders ?? 0),
            'reward_points' => $rewardPoints,
            'reward_value' => $rewardValue,
            'available_rewards' => $availableRewards,
            'available_discount' => $availableRewards * $rewardValue,
            'points_to_next_reward' => $pointsRemainder === 0 && $totalPoints > 0 ? 0 : $rewardPoints - $pointsRemainder,
        ];
    }

    public function isEnabled(): bool
    {
        return filter_var($this->settings->get('loyalty_points_enabled', '1'), FILTER_VALIDATE_BOOLEAN);
    }

    private function awardOrder(Order $order): void
    {
        if ($order->loyalty_points_awarded_at) {
            return;
        }

        DB::transaction(function () use ($order): void {
            $freshOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($freshOrder->loyalty_points_awarded_at || $freshOrder->status !== 'delivered') {
                return;
            }

            $points = $this->pointsForAmount(
                max(0, (float) $freshOrder->subtotal - (float) $freshOrder->discount_total)
            );

            if ($points <= 0) {
                $freshOrder->update([
                    'loyalty_points_earned' => 0,
                    'loyalty_points_awarded_at' => null,
                ]);

                return;
            }

            $freshOrder->update([
                'loyalty_points_earned' => $points,
                'loyalty_points_awarded_at' => now(),
            ]);

            $phone = $this->normalizePhone($freshOrder->customer_phone);
            $record = CustomerLoyaltyPoint::query()->lockForUpdate()->firstOrNew(['phone' => $phone]);
            $record->customer_name = $freshOrder->customer_name;
            $record->total_points = (int) $record->total_points + $points;
            $record->total_orders = (int) $record->total_orders + 1;
            $record->last_order_at = now();
            $record->save();
        });
    }

    private function removeOrderAward(Order $order): void
    {
        if (!$order->loyalty_points_awarded_at) {
            return;
        }

        DB::transaction(function () use ($order): void {
            $freshOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

            if (!$freshOrder->loyalty_points_awarded_at) {
                return;
            }

            $phone = $this->normalizePhone($freshOrder->customer_phone);

            if ($freshOrder->loyalty_points_earned > 0) {
                $record = CustomerLoyaltyPoint::query()->lockForUpdate()->where('phone', $phone)->first();

                if ($record) {
                    $record->total_points = max(0, (int) $record->total_points - (int) $freshOrder->loyalty_points_earned);
                    $record->total_orders = max(0, (int) $record->total_orders - 1);
                    $record->save();
                }
            }

            $freshOrder->update([
                'loyalty_points_earned' => 0,
                'loyalty_points_awarded_at' => null,
            ]);
        });
    }
}
