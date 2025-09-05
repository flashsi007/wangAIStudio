import { nodeToMarkdown } from "./nodeToMarkdown"
/**
* @description 生成 Ai 提示词
* @param prompt  string
* @param nodeTree : { data: { text: string }; children?: any[] }
*/
export function buildPrompter(prompt: string, nodeTree: { data: { text: string }; children?: any[] }): string {

  return `
     <提问>
     ${prompt}
     </提问>
     <AI回复>
        直接回答不要出现 好的xxxx或者分析xxxx之类的词，这样会让人感到不舒服。
     </AI回复>
          
       \n
      <脑图>
      ${nodeToMarkdown(nodeTree)}
      </脑图>
    `;

}