"use client"

import { useCallback, useState } from "react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"
import { Check, Code2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const LANGUAGE_GROUPS: { label: string; langs: { value: string; label: string }[] }[] = [
  {
    label: "Web",
    langs: [
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "jsx", label: "JSX" },
      { value: "tsx", label: "TSX" },
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "json", label: "JSON" },
    ],
  },
  {
    label: "Backend",
    langs: [
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
      { value: "php", label: "PHP" },
      { value: "ruby", label: "Ruby" },
      { value: "swift", label: "Swift" },
      { value: "kotlin", label: "Kotlin" },
    ],
  },
  {
    label: "Systems",
    langs: [
      { value: "c", label: "C" },
      { value: "cpp", label: "C++" },
      { value: "csharp", label: "C#" },
    ],
  },
  {
    label: "Data & Config",
    langs: [
      { value: "sql", label: "SQL" },
      { value: "yaml", label: "YAML" },
      { value: "xml", label: "XML" },
      { value: "bash", label: "Bash" },
      { value: "shell", label: "Shell" },
      { value: "dockerfile", label: "Dockerfile" },
    ],
  },
  {
    label: "Markup",
    langs: [
      { value: "markdown", label: "Markdown" },
      { value: "latex", label: "LaTeX" },
    ],
  },
]

const ALL_LANGS = LANGUAGE_GROUPS.flatMap((g) => g.langs)

function getLangLabel(value: string) {
  return ALL_LANGS.find((l) => l.value === value)?.label ?? value
}

export function CodeBlockComponent({ node, updateAttributes, editor }: NodeViewProps) {
  const [copied, setCopied] = useState(false)
  const language: string = node.attrs.language ?? ""
  const isEditable = editor?.isEditable ?? true

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(node.textContent).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [node.textContent])

  return (
    <NodeViewWrapper className="group relative my-4 not-prose">
      <TooltipProvider>
        <div className="overflow-hidden rounded-lg border bg-[#0d1117] dark:bg-[#0d1117]">
          {/* ── toolbar ── */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-white/40" />

              {isEditable ? (
                <Select
                  value={language || "auto"}
                  onValueChange={(val) =>
                    updateAttributes({ language: val === "auto" ? null : val })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="h-6 gap-0.5 border-0 bg-transparent px-1.5 text-[11px] font-mono text-white/60 shadow-none hover:bg-white/10 focus-visible:ring-0"
                  >
                    <SelectValue>
                      {language ? getLangLabel(language) : "Plain text"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="auto" className="text-xs font-mono">
                      Plain text
                    </SelectItem>
                    <SelectSeparator />
                    {LANGUAGE_GROUPS.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-[10px] uppercase tracking-wider">
                          {group.label}
                        </SelectLabel>
                        {group.langs.map((lang) => (
                          <SelectItem
                            key={lang.value}
                            value={lang.value}
                            className="text-xs font-mono"
                          >
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                language && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-mono"
                  >
                    {getLangLabel(language)}
                  </Badge>
                )
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-white/80 group-hover:opacity-100"
                  onClick={handleCopy}
                  tabIndex={-1}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {copied ? "Copied!" : "Copy code"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ── highlighted code ── */}
          <pre className="hljs m-0 overflow-x-auto rounded-none border-0 bg-transparent p-4 text-sm leading-relaxed">
            <NodeViewContent className="hljs-code-content" />
          </pre>
        </div>
      </TooltipProvider>
    </NodeViewWrapper>
  )
}
