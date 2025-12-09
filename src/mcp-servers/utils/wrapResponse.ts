export function wrapResponse(res, myCloseHandler) {
  const originalOn = res.on.bind(res);
  const originalOnce = res.once.bind(res);
  const originalRemove = res.removeListener.bind(res);

  // 存放外部注册的 close 回调
  const closeListeners = new Set<() => void>();

  // 是否已经挂载过统一的 close 分发器
  let dispatcherAttached = false;

  function ensureDispatcher() {
    if (dispatcherAttached) return;
    dispatcherAttached = true;

    // 只挂一次真正的 close 监听器
    originalOnce('close', () => {
      // 顺序执行所有外部回调
      for (const fn of closeListeners) {
        try {
          fn.call(res);
        } catch (e) {
          console.error('close listener error:', e);
        }
      }
      // 最后执行你的
      try {
        myCloseHandler.call(res);
      } catch (e) {
        console.error('my close listener error:', e);
      }
    });
  }

  // 重写 on
  res.on = (event, listener) => {
    if (event === 'close') {
      ensureDispatcher();
      closeListeners.add(listener);
    } else {
      originalOn(event, listener);
    }
    return res;
  };

  // 重写 once
  res.once = (event, listener) => {
    if (event === 'close') {
      ensureDispatcher();
      const wrapper = (...args) => {
        closeListeners.delete(wrapper); // 保证只执行一次
        listener.apply(res, args);
      };
      closeListeners.add(wrapper);
    } else {
      originalOnce(event, listener);
    }
    return res;
  };

  // 重写 removeListener / off
  res.removeListener = (event, listener) => {
    if (event === 'close') {
      closeListeners.delete(listener);
    } else {
      originalRemove(event, listener);
    }
    return res;
  };
  res.off = res.removeListener;

  return res;
}
