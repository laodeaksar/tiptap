import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Link from "@tiptap/extension-link"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { createLowlight } from "lowlight"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import html from "highlight.js/lib/languages/xml"
import css from "highlight.js/lib/languages/css"
import json from "highlight.js/lib/languages/json"
import bash from "highlight.js/lib/languages/bash"
import sql from "highlight.js/lib/languages/sql"
import yaml from "highlight.js/lib/languages/yaml"
import markdown from "highlight.js/lib/languages/markdown"
import rust from "highlight.js/lib/languages/rust"
import go from "highlight.js/lib/languages/go"
import java from "highlight.js/lib/languages/java"
import cpp from "highlight.js/lib/languages/cpp"
import c from "highlight.js/lib/languages/c"
import csharp from "highlight.js/lib/languages/csharp"
import php from "highlight.js/lib/languages/php"
import ruby from "highlight.js/lib/languages/ruby"
import swift from "highlight.js/lib/languages/swift"
import kotlin from "highlight.js/lib/languages/kotlin"
import xml from "highlight.js/lib/languages/xml"
import shell from "highlight.js/lib/languages/shell"
import dockerfile from "highlight.js/lib/languages/dockerfile"
import Blockquote from "@tiptap/extension-blockquote"
import Heading from "@tiptap/extension-heading"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { SlashCommand } from "../slash-command"
import { DropImage } from "./drop-image"
import { ImageAlign } from "./image-align"
import { CodeBlockComponent } from "./code-block"

const lowlight = createLowlight()
lowlight.register("javascript", javascript)
lowlight.register("typescript", typescript)
lowlight.register("jsx", javascript)
lowlight.register("tsx", typescript)
lowlight.register("python", python)
lowlight.register("html", html)
lowlight.register("xml", xml)
lowlight.register("css", css)
lowlight.register("json", json)
lowlight.register("bash", bash)
lowlight.register("shell", shell)
lowlight.register("sql", sql)
lowlight.register("yaml", yaml)
lowlight.register("markdown", markdown)
lowlight.register("rust", rust)
lowlight.register("go", go)
lowlight.register("java", java)
lowlight.register("cpp", cpp)
lowlight.register("c", c)
lowlight.register("csharp", csharp)
lowlight.register("php", php)
lowlight.register("ruby", ruby)
lowlight.register("swift", swift)
lowlight.register("kotlin", kotlin)
lowlight.register("dockerfile", dockerfile)

export const editorExtensions = [
  StarterKit.configure({
    blockquote: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    link: false,
  }),
  Heading.configure({ levels: [1, 2, 3] }),
  Blockquote,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent)
    },
  }).configure({ lowlight, defaultLanguage: null }),
  HorizontalRule,
  TextStyle,
  Color,
  Placeholder.configure({
    placeholder: "Type '/' for commands, or start writing…",
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "underline text-primary cursor-pointer" },
  }),
  ImageAlign,
  SlashCommand,
  DropImage,
]
