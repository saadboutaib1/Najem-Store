import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToPageTop(behavior = 'auto') {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToPageTop();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const trigger = event.target.closest('button, a');

      if (!trigger || trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') {
        return;
      }

      window.setTimeout(() => {
        window.requestAnimationFrame(() => scrollToPageTop('smooth'));
      }, 0);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
