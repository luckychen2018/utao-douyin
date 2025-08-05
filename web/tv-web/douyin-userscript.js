// ==UserScript==
// @name         抖音虚拟鼠标
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  为抖音网页版添加键盘控制的虚拟鼠标
// @author       You
// @match        https://www.douyin.com/*
// @grant        none
// ==/UserScript==

console.log('[VirtualMouse] 脚本开始执行');

(function() {
    'use strict';

    // 创建虚拟鼠标元素
    const virtualMouse = document.createElement('div');
    virtualMouse.id = 'virtual-mouse';
    virtualMouse.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #ff0000;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transition: transform 0.1s ease;
        display: block;
    `;
    document.body.appendChild(virtualMouse);

    // 创建虚拟鼠标样式元素
    const style = document.createElement('style');
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
        head.appendChild(style);
    }
    // 初始位置居中
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isActive = true;

    // 更新鼠标位置
    function updatePosition() {
        virtualMouse.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }

    // 移动鼠标
    function moveMouse(dx, dy) {
        mouseX = Math.max(0, Math.min(window.innerWidth, mouseX + dx));
        mouseY = Math.max(0, Math.min(window.innerHeight, mouseY + dy));
        updatePosition();
    }

    // 键盘控制
    function handleKeydown(e) {
        if (!isActive) return;

        switch(e.key) {
            case 'ArrowUp':
                moveMouse(0, -10);
                e.preventDefault();
                break;
            case 'ArrowDown':
                moveMouse(0, 10);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                moveMouse(-10, 0);
                e.preventDefault();
                break;
            case 'ArrowRight':
                moveMouse(10, 0);
                e.preventDefault();
                break;
            case 'Enter':
                const element = document.elementFromPoint(mouseX, mouseY);
                if (element) {
                    element.click();
                    // 模拟鼠标事件以确保兼容性
                    const clickEvent = new MouseEvent('click', {
                        clientX: mouseX,
                        clientY: mouseY,
                        bubbles: true,
                        cancelable: true
                    });
                    element.dispatchEvent(clickEvent);
                }
                e.preventDefault();
                break;
        }
    }

    // 清理函数
    function cleanup() {
        isActive = false;
        virtualMouse.remove();
        document.removeEventListener('keydown', handleKeydown);
    }

    // 初始化
    updatePosition();
    document.addEventListener('keydown', handleKeydown);

    // 页面离开时清理
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
})();

// 自动关闭登录弹窗 - 增强版
function closeLoginPopup() {
  console.log('[AutoClose] 增强版检查登录弹窗...');
  
  // 检查主文档中的弹窗
  let popup = findPopupInDocument(document);
  
  // 如果未找到，检查所有iframe
  if (!popup) {
    console.log('[AutoClose] 主文档未找到弹窗，检查iframe...');
    const iframes = document.querySelectorAll('iframe');
    
    for (const iframe of iframes) {
      try {
        // 尝试访问iframe内容
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        popup = findPopupInDocument(iframeDoc);
        
        if (popup) {
          console.log('[AutoClose] 在iframe中找到弹窗');
          break;
        }
      } catch (e) {
        console.log('[AutoClose] 无法访问iframe内容:', e);
      }
    }
  }
  
  if (!popup) {
    console.log('[AutoClose] 未找到登录弹窗');
    return false;
  }
  
  // 尝试关闭弹窗
  return attemptClosePopup(popup);
}

// 在单个文档中查找弹窗
function findPopupInDocument(doc) {
  // 扩展弹窗检测选择器
  const popupSelectors = [
    'div:contains("登录后免费畅享高清视频")',
    'div[aria-modal="true"]',
    'div[role="dialog"]',
    'div.modal',
    'div[class*="popup"][class*="login"]',
    'div[style*="position: fixed"][style*="z-index: 2"]',
    'div[style*="position: fixed"][style*="z-index: 9999"]'
  ];
  
  for (const selector of popupSelectors) {
    try {
      let popup = null;
      
      if (window.jQuery && doc === document) {
        popup = window.jQuery(selector).first()[0];
      } else {
        // 使用更健壮的XPath匹配
        const xpath = selector.replace(/:contains\("([^"]+)"\)/g, 
          (_, text) => `[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'${text.toLowerCase()}')]`);
        popup = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }
      
      if (popup) {
        const style = getComputedStyle(popup);
        // 更严格的可见性检查
        if (style.display !== 'none' && 
            style.visibility !== 'hidden' && 
            style.opacity !== '0' && 
            style.zIndex !== '-1' && 
            popup.offsetWidth > 0 && 
            popup.offsetHeight > 0) {
          console.log('[AutoClose] 找到可见弹窗:', popup);
          return popup;
        }
      }
    } catch (e) {
      console.log('[AutoClose] 选择器错误:', selector, e);
    }
  }
  
  return null;
}

// 尝试关闭弹窗的专用函数
function attemptClosePopup(popup) {
  // 扩展关闭按钮选择器
  const closeButtonSelectors = [
    '.close, .icon-close, .popup-close, .dialog-close',
    '[class*=close], [onclick*=close], [aria-label*=关闭], [aria-label*=Close]',
    'button:contains("关闭"), button:contains("×"), button:contains("Cancel")',
    'button:contains("我知道了"), div:contains("我知道了")[role*=button], span:contains("我知道了")[role*=button]',
    'a[class*=close], div[class*=close][role=button], span[class*=close]',
    'svg[class*=close], img[alt*=关闭], img[alt*=Close]',
    '[class*=icon][class*=close], [class*=btn][class*=close]'
  ];
  
  // 尝试所有关闭按钮选择器
  for (const selector of closeButtonSelectors) {
    try {
      let closeBtn = null;
      
      if (window.jQuery && popup.ownerDocument === document) {
        closeBtn = window.jQuery(popup).find(selector).first()[0];
      } else {
        const xpath = ".//*" + selector.replace(/:contains\("([^"]+)"\)/g, 
          (_, text) => `[contains(text(),'${text}')]`);
        closeBtn = popup.ownerDocument.evaluate(xpath, popup, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }
      
      if (closeBtn) {
        console.log('[AutoClose] 找到关闭按钮:', closeBtn);
        
        // 模拟真实点击（增强版）
        const simulateClick = (element) => {
          const rect = element.getBoundingClientRect();
          const events = [
            new MouseEvent('mouseover', {clientX: rect.left+10, clientY: rect.top+10}),
            new MouseEvent('mousedown', {clientX: rect.left+10, clientY: rect.top+10}),
            new MouseEvent('click', {clientX: rect.left+10, clientY: rect.top+10, bubbles: true, cancelable: true}),
            new MouseEvent('mouseup', {clientX: rect.left+10, clientY: rect.top+10})
          ];
          
          events.forEach(event => element.dispatchEvent(event));
        };
        
        simulateClick(closeBtn);
        console.log('[AutoClose] 已触发关闭按钮点击');
        return true;
      }
    } catch (e) {
      console.log('[AutoClose] 关闭按钮选择器错误:', selector, e);
    }
  }
  
  // 如果找不到关闭按钮，强制隐藏弹窗（增强版）
  if (getComputedStyle(popup).display !== 'none') {
    console.log('[AutoClose] 未找到关闭按钮，强制隐藏弹窗');
    
    // 多重隐藏策略
    const hideStyles = {
      display: 'none',
      visibility: 'hidden',
      opacity: '0',
      zIndex: '-9999',
      position: 'absolute',
      top: '-9999px',
      left: '-9999px'
    };
    
    // 应用所有隐藏样式
    Object.assign(popup.style, hideStyles);
    
    // 如果弹窗有父容器，也尝试隐藏
    const parent = popup.parentElement;
    if (parent && getComputedStyle(parent).zIndex > 0) {
      Object.assign(parent.style, hideStyles);
      console.log('[AutoClose] 同时隐藏弹窗父容器');
    }
    
    return true;
  }
  
  return false;
}

// 添加微任务检查
function setupMicrotaskCheck() {
  console.log('[AutoClose] 设置微任务弹窗检查...');
  
  const originalMutationObserver = window.MutationObserver;
  window.MutationObserver = class extends originalMutationObserver {
    constructor(callback) {
      super((mutations) => {
        callback(mutations);
        // 在微任务中再次检查
        queueMicrotask(() => {
          console.log('[AutoClose] 微任务中检查弹窗...');
          closeLoginPopup();
        });
      });
    }
  };
}

// 修改初始化函数，添加微任务检查
function setupLoginPopupHandler() {
  console.log('[AutoClose] 初始化终极增强版弹窗自动关闭功能');
  
  // 设置微任务检查
  setupMicrotaskCheck();
  
  // 设置持久化DOM监听
  const observer = setupPopupMutationObserver();
  
  // 设置滚动检测
  const cleanupScroll = setupScrollDetection();
  
  // 立即检查一次
  closeLoginPopup();
  
  // 延长检查时间至15分钟
  let attempts = 0;
  const maxAttempts = 1800; // 15分钟 (1800*500ms)
  const checkInterval = setInterval(() => {
    attempts++;
    console.log('[AutoClose] 持续检查 (' + attempts + '/' + maxAttempts + ')');
    
    closeLoginPopup();
    
    if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      cleanupScroll(); // 清理滚动监听
      console.log('[AutoClose] 长时间检查周期结束，保留DOM监听');
    }
  }, 500);
}

// 修改MutationObserver目标为documentElement
function setupPopupMutationObserver() {
  console.log('[AutoClose] 设置全局DOM变化监听...');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0 || mutation.type === 'attributes') {
        console.log('[AutoClose] 检测到全局DOM变化，检查弹窗...');
        closeLoginPopup();
      }
    });
  });
  
  // 监听整个文档的变化
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden'],
    characterData: false
  });
  
  window.popupObserver = observer;
  
  return observer;
}

// 增强点击模拟，添加触摸事件
function attemptClosePopup(popup) {
  // 扩展关闭按钮选择器
  const closeButtonSelectors = [
    '.close, .icon-close, .popup-close, .dialog-close',
    '[class*=close], [onclick*=close], [aria-label*=关闭], [aria-label*=Close]',
    'button:contains("关闭"), button:contains("×"), button:contains("Cancel")',
    'a[class*=close], div[class*=close][role=button], span[class*=close]',
    'svg[class*=close], img[alt*=关闭], img[alt*=Close]',
    '[class*=icon][class*=close], [class*=btn][class*=close]'
  ];
  
  // 尝试所有关闭按钮选择器
  for (const selector of closeButtonSelectors) {
    try {
      let closeBtn = null;
      
      if (window.jQuery && popup.ownerDocument === document) {
        closeBtn = window.jQuery(popup).find(selector).first()[0];
      } else {
        const xpath = ".//*" + selector.replace(/:contains\("([^"]+)"\)/g, 
          (_, text) => `[contains(text(),'${text}')]`);
        closeBtn = popup.ownerDocument.evaluate(xpath, popup, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }
      
      if (closeBtn) {
        console.log('[AutoClose] 找到关闭按钮:', closeBtn);
        
        // 模拟真实用户交互（包含触摸事件）
        const simulateUserInteraction = (element) => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // 鼠标事件
          const mouseEvents = [
            new MouseEvent('mouseover', {clientX: centerX, clientY: centerY, bubbles: true}),
            new MouseEvent('mousedown', {clientX: centerX, clientY: centerY, bubbles: true}),
            new MouseEvent('click', {clientX: centerX, clientY: centerY, bubbles: true, cancelable: true}),
            new MouseEvent('mouseup', {clientX: centerX, clientY: centerY, bubbles: true})
          ];
          
          // 触摸事件（模拟移动设备）
          const touchEvents = [
            new TouchEvent('touchstart', {touches: [{clientX: centerX, clientY: centerY}]}, {bubbles: true}),
            new TouchEvent('touchend', {changedTouches: [{clientX: centerX, clientY: centerY}]}, {bubbles: true})
          ];
          
          // 先触发鼠标事件
          mouseEvents.forEach(event => element.dispatchEvent(event));
          
          // 再触发触摸事件（兼容性）
          if (window.TouchEvent) {
            touchEvents.forEach(event => element.dispatchEvent(event));
          }
          
          // 直接调用onclick（如果存在）
          if (typeof element.onclick === 'function') {
            console.log('[AutoClose] 直接调用onclick方法');
            element.onclick();
          }
        };
        
        simulateUserInteraction(closeBtn);
        console.log('[AutoClose] 已触发关闭按钮交互');
        return true;
      }
    } catch (e) {
      console.log('[AutoClose] 关闭按钮选择器错误:', selector, e);
    }
  }
  
  // 如果找不到关闭按钮，强制隐藏弹窗（增强版）
  if (getComputedStyle(popup).display !== 'none') {
    console.log('[AutoClose] 未找到关闭按钮，强制隐藏弹窗');
    
    // 多重隐藏策略
    const hideStyles = {
      display: 'none',
      visibility: 'hidden',
      opacity: '0',
      zIndex: '-9999',
      position: 'absolute',
      top: '-9999px',
      left: '-9999px'
    };
    
    // 应用所有隐藏样式
    Object.assign(popup.style, hideStyles);
    
    // 如果弹窗有父容器，也尝试隐藏
    const parent = popup.parentElement;
    if (parent && getComputedStyle(parent).zIndex > 0) {
      Object.assign(parent.style, hideStyles);
      console.log('[AutoClose] 同时隐藏弹窗父容器');
    }
    
    return true;
  }
  
  return false;
}

// 添加页面滚动检测
function setupScrollDetection() {
  console.log('[AutoClose] 设置滚动检测...');
  
  let lastScrollTime = 0;
  const scrollThreshold = 1000; // 1秒
  
  const handleScroll = () => {
    const now = Date.now();
    if (now - lastScrollTime > scrollThreshold) {
      console.log('[AutoClose] 检测到页面滚动，检查弹窗...');
      closeLoginPopup();
      lastScrollTime = now;
    }
  };
  
  window.addEventListener('scroll', handleScroll, true);
  
  // 移除事件监听器的清理函数
  return () => {
    window.removeEventListener('scroll', handleScroll, true);
  };
}

// 修改初始化函数，添加滚动检测
function setupLoginPopupHandler() {
  console.log('[AutoClose] 初始化终极版弹窗自动关闭功能');
  
  // 设置持久化DOM监听
  const observer = setupPopupMutationObserver();
  
  // 设置滚动检测
  const cleanupScroll = setupScrollDetection();
  
  // 立即检查一次
  closeLoginPopup();
  
  // 延长检查时间至10分钟
  let attempts = 0;
  const maxAttempts = 1200; // 10分钟 (1200*500ms)
  const checkInterval = setInterval(() => {
    attempts++;
    console.log('[AutoClose] 持续检查 (' + attempts + '/' + maxAttempts + ')');
    
    closeLoginPopup();
    
    if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      cleanupScroll(); // 清理滚动监听
      console.log('[AutoClose] 长时间检查周期结束，保留DOM监听');
    }
  }, 500);
}

// 在初始化函数中添加监听器
function setupLoginPopupHandler() {
  console.log('[AutoClose] 初始化弹窗自动关闭功能');
  
  // 设置DOM变化监听
  const observer = setupPopupMutationObserver();
  
  // 立即检查一次
  if (!closeLoginPopup()) {
    // 延长检查时间至60秒，增加检查频率
    let attempts = 0;
    const maxAttempts = 120; // 60秒 (120*500ms)
    const checkInterval = setInterval(() => {
      attempts++;
      console.log('[AutoClose] 定期检查 (' + attempts + '/' + maxAttempts + ')');
      
      if (closeLoginPopup() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        observer.disconnect(); // 停止监听
        console.log('[AutoClose] 弹窗检查结束，已停止DOM监听');
      }
    }, 500);
  } else {
    observer.disconnect(); // 找到弹窗后停止监听
  }
}

// 增强脚本加载检测
console.log('[AutoClose] 脚本已加载，等待页面就绪...');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[AutoClose] DOM已就绪，设置弹窗处理...');
  setupVirtualMouse();
  setupLoginPopupHandler();
});

// 添加备用触发机制（针对动态加载内容）
setTimeout(() => {
  if (document.readyState === 'complete') {
    console.log('[AutoClose] 备用触发: 页面已完全加载');
    setupLoginPopupHandler();
  }
}, 3000);

// 在现有页面加载完成逻辑中添加弹窗处理
document.addEventListener('DOMContentLoaded', function() {
  setupVirtualMouse();
  setupLoginPopupHandler(); // 添加这行
});

function initVirtualMouse() {
  console.log('[VirtualMouse] 开始初始化虚拟鼠标');
  try {
    // 创建光标元素
    const cursor = document.createElement('div');
    cursor.id = 'virtual-mouse';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: red;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999999;
      transition: transform 0.1s ease;
      box-shadow: 0 0 10px rgba(255,0,0,0.8);
    `;
    document.body.appendChild(cursor);
    console.log('[VirtualMouse] 光标元素已添加到DOM');

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    updateCursorPosition();

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);
    console.log('[VirtualMouse] 键盘事件监听器已添加');

    // 添加窗口大小改变监听
    window.addEventListener('resize', () => {
      x = Math.min(x, window.innerWidth - 10);
      y = Math.min(y, window.innerHeight - 10);
      updateCursorPosition();
    });
    console.log('[VirtualMouse] 窗口大小改变监听器已添加');

    return true;
  } catch (error) {
    console.error('[VirtualMouse] 初始化失败:', error);
    return false;
  }
}

// 初始化
console.log('[VirtualMouse] 等待DOM加载完成');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[VirtualMouse] DOM加载完成，开始初始化组件');
  const mouseInitialized = initVirtualMouse();
  const popupHandlerSetup = setupLoginPopupHandler();
  console.log('[VirtualMouse] 组件初始化状态 - 虚拟鼠标:', mouseInitialized, '弹窗处理:', popupHandlerSetup);
});

// 添加3秒后备用初始化机制，防止DOMContentLoaded事件问题
setTimeout(() => {
  if (!document.getElementById('virtual-mouse')) {
    console.log('[VirtualMouse] DOMContentLoaded未触发，尝试备用初始化');
    initVirtualMouse();
  }
}, 3000);

console.log('[VirtualMouse] 脚本加载完成');