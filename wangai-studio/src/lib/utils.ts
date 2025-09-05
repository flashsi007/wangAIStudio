import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Editor } from '@tiptap/react'

export const getRenderContainer = (editor: Editor, nodeType: string) => {
  const {
    view,
    state: {
      selection: { from },
    },
  } = editor

  const elements = document.querySelectorAll('.has-focus')
  const elementCount = elements.length
  const innermostNode = elements[elementCount - 1]
  const element = innermostNode

  if (
    (element && element.getAttribute('data-type') && element.getAttribute('data-type') === nodeType) ||
    (element && element.classList && element.classList.contains(nodeType))
  ) {
    return element
  }

  const node = view.domAtPos(from).node as HTMLElement
  let container = node

  if (!container.tagName) {
    // @ts-ignore
    container = node.parentElement
  }

  while (
    container &&
    !(container.getAttribute('data-type') && container.getAttribute('data-type') === nodeType) &&
    !container.classList.contains(nodeType)
  ) {
    // @ts-ignore
    container = container.parentElement
  }

  return container
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
    * 生成UUID v4格式的唯一标识符
    * @returns {string} 返回格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx 的UUID字符串
    */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;           // 生成0-15的随机数
    const v = c === 'x' ? r : (r & 0x3) | 0x8;    // x位置用随机数，y位置用特定格式
    return v.toString(16);                        // 转换为16进制字符
  });
}