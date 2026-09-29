import type { Component } from "vue"
import type { MarkdownNode } from "./markdownTypes.ts"
import MarkdownBlockquote from "./nodes/MarkdownBlockquote.vue"
import MarkdownBreak from "./nodes/MarkdownBreak.vue"
import MarkdownCode from "./nodes/MarkdownCode.vue"
import MarkdownDefinition from "./nodes/MarkdownDefinition.vue"
import MarkdownDelete from "./nodes/MarkdownDelete.vue"
import MarkdownEmphasis from "./nodes/MarkdownEmphasis.vue"
import MarkdownFootnoteDefinition from "./nodes/MarkdownFootnoteDefinition.vue"
import MarkdownFootnoteReference from "./nodes/MarkdownFootnoteReference.vue"
import MarkdownHeading from "./nodes/MarkdownHeading.vue"
import MarkdownHtml from "./nodes/MarkdownHtml.vue"
import MarkdownImage from "./nodes/MarkdownImage.vue"
import MarkdownImageReference from "./nodes/MarkdownImageReference.vue"
import MarkdownInlineCode from "./nodes/MarkdownInlineCode.vue"
import MarkdownLink from "./nodes/MarkdownLink.vue"
import MarkdownLinkReference from "./nodes/MarkdownLinkReference.vue"
import MarkdownList from "./nodes/MarkdownList.vue"
import MarkdownListItem from "./nodes/MarkdownListItem.vue"
import MarkdownParagraph from "./nodes/MarkdownParagraph.vue"
import MarkdownRoot from "./nodes/MarkdownRoot.vue"
import MarkdownStrong from "./nodes/MarkdownStrong.vue"
import MarkdownTable from "./nodes/MarkdownTable.vue"
import MarkdownTableCell from "./nodes/MarkdownTableCell.vue"
import MarkdownTableRow from "./nodes/MarkdownTableRow.vue"
import MarkdownText from "./nodes/MarkdownText.vue"
import MarkdownThematicBreak from "./nodes/MarkdownThematicBreak.vue"
import MarkdownUnsupportedNode from "./nodes/MarkdownUnsupportedNode.vue"
import MarkdownYaml from "./nodes/MarkdownYaml.vue"

const components: Partial<Record<MarkdownNode["type"], Component>> = {
  root: MarkdownRoot,
  paragraph: MarkdownParagraph,
  heading: MarkdownHeading,
  text: MarkdownText,
  emphasis: MarkdownEmphasis,
  strong: MarkdownStrong,
  delete: MarkdownDelete,
  inlineCode: MarkdownInlineCode,
  code: MarkdownCode,
  blockquote: MarkdownBlockquote,
  list: MarkdownList,
  listItem: MarkdownListItem,
  link: MarkdownLink,
  linkReference: MarkdownLinkReference,
  image: MarkdownImage,
  imageReference: MarkdownImageReference,
  definition: MarkdownDefinition,
  footnoteDefinition: MarkdownFootnoteDefinition,
  footnoteReference: MarkdownFootnoteReference,
  table: MarkdownTable,
  tableRow: MarkdownTableRow,
  tableCell: MarkdownTableCell,
  thematicBreak: MarkdownThematicBreak,
  break: MarkdownBreak,
  html: MarkdownHtml,
  yaml: MarkdownYaml,
}

export function resolveMarkdownNodeComponent(node: MarkdownNode): Component {
  return components[node.type] ?? MarkdownUnsupportedNode
}
