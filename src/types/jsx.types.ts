import type { InlineKeyboardButton, InputFile, InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from "grammy/types";
import type { InlineKeyboard, Context } from "grammy";
import type { ReactiveContextFlavor } from "~/types/plugin.types";
import type { JSX } from "~/jsx/runtime/jsx.runtime";

// ! Utility types
//
/**
 * Adds optional JSX children support to a props object.
 *
 * This is the base utility used for intrinsic elements and custom
 * component props that may receive renderable child nodes.
 *
 * @template P
 */
export type WithChildren<P = {}> = P & {
    children?: Node
};

/**
 * Extracts the props type from a {@link WithChildren}-compatible shape.
 *
 * If the target type does not use `WithChildren`, the original type
 * is returned unchanged.
 *
 * @template T
 */
export type PropsOf<T> = T extends WithChildren<infer P> ? P : T;

// ! Intrinsic elements

/**
 * Runtime registry of all supported intrinsic JSX elements.
 *
 * This object defines the canonical intrinsic tag surface supported by
 * the Telegram JSX renderer.
 *
 * Use {@link IntrinsicElements} for the inferred type-safe version.
 */
export const intrinsicElements = {
    b: {} as WithChildren,
    i: {} as WithChildren,
    u: {} as WithChildren,
    s: {} as WithChildren,
    spoiler: {} as WithChildren,
    a: {} as WithChildren<{ href: string }>,
    emoji: {} as WithChildren<{ id: string }>,
    time: {} as WithChildren<{ unix: number; format?: TimeFormat }>,
    code: {} as WithChildren,
    codeblock: {} as WithChildren<{ lang?: CodeBlockLanguages }>,
    blockquote: {} as WithChildren<{ expandable?: boolean }>,
    h: {} as WithChildren,
    p: {} as WithChildren,
    br: {} as {},
    media: {} as MediaProps,
    preview: {} as { src: string; position?: "top" | "bottom"; size?: "small" | "large" },
    button: {} as WithChildren<InlineButtonProps>,
    mention: {} as WithChildren<{ id: number }>,
} satisfies Record<string, unknown>;

/**
 * Type-safe map of all supported intrinsic JSX elements and their props.
 *
 * Each key represents an intrinsic JSX tag name and each value
 * defines its allowed props shape.
 */
export type IntrinsicElements = typeof intrinsicElements;

/**
 * Resolves the exact props type for a specific intrinsic element tag.
 *
 * @template {keyof IntrinsicElements} K
 */
export type ExactIntrinsicElement<K extends keyof IntrinsicElements> =
    IntrinsicElements[K]

/**
 * Union type describing all valid intrinsic element creation payloads.
 *
 * Each variant binds a `tag` to its corresponding strongly typed `props`.
 */
export type IntrinsicElementOptions = {
    [K in keyof IntrinsicElements]: {
        tag: K, props: IntrinsicElements[K]
    }
}[keyof IntrinsicElements]

// ! Media element

export type MediaPropsMap = {
    photo: {
        spoiler?: boolean,
        position?: "top" | "bottom",
    },
    video: {
        spoiler?: boolean,
        position?: "top" | "bottom",
        cover?: string | InputFile,
        thumbnail?: InputFile,
        width?: number,
        height?: number,
        start?: number,
        duration?: number,
        stream?: boolean,
    },
    audio: {
        thumbnail?: InputFile,
        duration?: number,
        performer?: string,
        title?: string
    },
    animation: {
        spoiler?: boolean,
        position?: "top" | "bottom",
        thumbnail?: InputFile,
        width?: number,
        height?: number,
        duration?: number,
    },
    document: {
        thumbnail?: InputFile,
        disableContentTypeDetection?: boolean
    },
}

export type MediaProps = {
    [K in keyof MediaPropsMap]: {
        src: string | InputFile
        variant?: K
    } & MediaPropsMap[K]
}[keyof MediaPropsMap]

// ! Button element

/**
 * Mapping of supported inline keyboard button variants to their payload shapes.
 *
 * Used internally for variant-safe button entity creation.
 */
export type InlineButtonPropsMap = {
    url: { url: string }
    callback: { event?: string, onClick?: (ctx: ReactiveContextFlavor<Context>) => Promise<void> | void }
    app: { url: string }
    login: { data: InlineKeyboardButton.LoginButton['login_url'] }
    switch_inline: { query: string }
    switch_inline_current: { query: string }
    switch_inline_chosen: { data: InlineKeyboardButton.SwitchInlineChosenChatButton['switch_inline_query_chosen_chat'] }
    copy: { value: string }
    game: {}
    pay: {}
}

/**
 * Union type describing all supported inline keyboard button variants.
 *
 * Includes shared button styling options and variant-specific payloads.
 */
export type InlineButtonProps = {
    [K in keyof InlineButtonPropsMap]: {
        variant?: K
        color?: Parameters<typeof InlineKeyboard.prototype.style>[0]
        row?: boolean
    } & InlineButtonPropsMap[K]
}[keyof InlineButtonPropsMap]

/**
 * Resolves the exact payload type for a specific inline button variant.
 *
 * @template {keyof InlineButtonPropsMap} K
 */
export type ExactInlineButtonProps<K extends keyof InlineButtonPropsMap> =
    InlineButtonPropsMap[K]

// ! Entity system
//
/**
 * Factory output map for intrinsic entity creation.
 *
 * Each intrinsic tag is mapped to its exact serialized entity shape.
 */
export type EntityFactoryMap = {
    [K in keyof IntrinsicElements]: { type: K } & EntityPropsMap[K]
}

/**
 * Maps intrinsic element tags to their extracted serializable props.
 */
export type EntityPropsMap = {
    [K in keyof IntrinsicElements]: Extract<PropsOf<IntrinsicElements[K]>, object>
}

/**
 * Internal entity lookup map keyed by intrinsic tag name.
 */
export type EntityMap = {
    [K in keyof IntrinsicElements]:
        EntityBase<K> &
        (keyof PropsOf<IntrinsicElements[K]> extends never
            ? {}
            : PropsOf<IntrinsicElements[K]>)
}

/**
 * Base discriminated entity shape.
 *
 * @template {string} K
 */
export type EntityBase<K extends string> = { type: K }

/**
 * Union type of all supported intrinsic render entities.
 *
 * This is the primary metadata representation used by intrinsic
 * JSX tree nodes.
 */
export type Entity = {
    [K in keyof IntrinsicElements]:
        keyof PropsOf<IntrinsicElements[K]> extends never
            ? EntityBase<K>
            : EntityBase<K> & PropsOf<IntrinsicElements[K]>
}[keyof IntrinsicElements];

// ! Tree nodes

/**
 * Primitive node values supported by the JSX render tree.
 */
export type PlainNode = string | number | boolean | null | undefined;

/**
 * A renderable JSX tree node.
 *
 * Supports primitive values, elements, nested arrays,
 * and promised async nodes.
 */
export type Node = PlainNode | JSX.Element | Node[] | Promise<PlainNode | JSX.Element | Node[]>;

/**
 * Union type of all normalized render tree elements.
 */
export type Element = PlainElement | FragmentElement | IntrinsicElement;

/**
 * Functional JSX component signature for the renderer.
 */
export type Component = (props: any) => JSX.Element | Promise<JSX.Element>;

// ! Tree element interfaces

/**
 * Plain text render node.
 */
export interface PlainElement { type: "plain"; value: PlainNode; }

/**
 * Fragment render node used to group multiple children.
 */
export interface FragmentElement { type: "fragment"; children: JSX.Element[]; }

/**
 * Intrinsic JSX render node with serialized entity metadata.
 */
export interface IntrinsicElement { type: "intrinsic"; entity: Entity; children: JSX.Element[]; }

// ! Prop value types

/**
 * Supported Telegram time formatting tokens.
 */
export type TimeFormat = "r" | `${"w" | ""}${"d" | "D" | ""}${"t" | "T" | ""}`

/**
 * Supported syntax highlighting language identifiers for `codeblock`.
 *
 * Includes all Prism-compatible language aliases plus custom strings.
 */
export type CodeBlockLanguages = (string & {})
    | "markup" | "html" | "xml" | "svg" | "mathml" | "ssml"
    | "atom" | "rss" | "css" | "clike" | "regex" | "javascript"
    | "js" | "abap" | "abnf" | "actionscript" | "ada" | "agda"
    | "al" | "antlr4" | "g4" | "apacheconf" | "sql" | "apex"
    | "apl" | "applescript" | "aql" | "c" | "cpp" | "arduino"
    | "ino" | "arff" | "armasm" | "arm-asm" | "bash" | "sh"
    | "shell" | "yaml" | "yml" | "markdown" | "md" | "arturo"
    | "art" | "asciidoc" | "adoc" | "csharp" | "cs" | "dotnet"
    | "aspnet" | "asm6502" | "asmatmel" | "autohotkey" | "autoit" | "avisynth"
    | "avs" | "avro-idl" | "avdl" | "awk" | "gawk" | "basic"
    | "batch" | "bbcode" | "shortcode" | "bbj" | "bicep" | "birb"
    | "bison" | "bnf" | "rbnf" | "bqn" | "brainfuck" | "brightscript"
    | "bro" | "cfscript" | "cfc" | "chaiscript" | "cil" | "cilkc"
    | "cilk-c" | "cilkcpp" | "cilk-cpp" | "cilk" | "clojure" | "cmake"
    | "cobol" | "coffeescript" | "coffee" | "concurnas" | "conc" | "csp"
    | "cooklang" | "ruby" | "rb" | "crystal" | "csv" | "cue"
    | "cypher" | "d" | "dart" | "dataweave" | "dax" | "dhall"
    | "diff" | "markup-templating" | "django" | "jinja2" | "dns-zone-file" | "dns-zone"
    | "docker" | "dockerfile" | "dot" | "gv" | "ebnf" | "editorconfig"
    | "eiffel" | "ejs" | "eta" | "elixir" | "elm" | "lua"
    | "etlua" | "erb" | "erlang" | "excel-formula" | "xlsx" | "xls"
    | "fsharp" | "factor" | "false" | "fift" | "firestore-security-rules" | "flow"
    | "fortran" | "ftl" | "func" | "gml" | "gamemakerlanguage" | "gap"
    | "gcode" | "gdscript" | "gedcom" | "gettext" | "po" | "git"
    | "glsl" | "gn" | "gni" | "linker-script" | "ld" | "go"
    | "go-module" | "go-mod" | "gradle" | "graphql" | "groovy" | "less"
    | "scss" | "textile" | "haml" | "handlebars" | "hbs" | "mustache"
    | "haskell" | "hs" | "haxe" | "hcl" | "hlsl" | "hoon"
    | "hpkp" | "hsts" | "json" | "webmanifest" | "uri" | "url"
    | "http" | "ichigojam" | "icon" | "icu-message-format" | "idris" | "idr"
    | "ignore" | "gitignore" | "hgignore" | "npmignore" | "inform7" | "ini"
    | "io" | "j" | "java" | "scala" | "php" | "javadoclike"
    | "javadoc" | "javastacktrace" | "jolie" | "jq" | "typescript" | "ts"
    | "jsdoc" | "n4js" | "n4jsd" | "json5" | "jsonp" | "jsstacktrace"
    | "julia" | "keepalived" | "keyman" | "kotlin" | "kt" | "kts"
    | "kusto" | "latex" | "tex" | "context" | "latte" | "scheme"
    | "lilypond" | "ly" | "liquid" | "lisp" | "emacs" | "elisp"
    | "emacs-lisp" | "livescript" | "llvm" | "log" | "lolcode" | "magma"
    | "makefile" | "mata" | "matlab" | "maxscript" | "mel" | "mermaid"
    | "metafont" | "mizar" | "mongodb" | "monkey" | "moonscript" | "moon"
    | "n1ql" | "nand2tetris-hdl" | "naniscript" | "nani" | "nasm" | "neon"
    | "nevod" | "nginx" | "nim" | "nix" | "nsis" | "objectivec"
    | "objc" | "ocaml" | "odin" | "opencl" | "openqasm" | "qasm"
    | "oz" | "parigp" | "parser" | "pascal" | "objectpascal" | "pascaligo"
    | "psl" | "pcaxis" | "px" | "peoplecode" | "pcode" | "perl"
    | "phpdoc" | "plant-uml" | "plantuml" | "plsql" | "powerquery" | "pq"
    | "mscript" | "powershell" | "processing" | "prolog" | "promql" | "properties"
    | "protobuf" | "stylus" | "twig" | "pug" | "puppet" | "purebasic"
    | "pbfasm" | "python" | "py" | "qsharp" | "qs" | "q"
    | "qml" | "qore" | "r" | "racket" | "rkt" | "cshtml"
    | "razor" | "jsx" | "tsx" | "reason" | "rego" | "renpy"
    | "rpy" | "rescript" | "res" | "rest" | "rip" | "roboconf"
    | "robotframework" | "robot" | "rust" | "sas" | "sass" | "shell-session"
    | "sh-session" | "shellsession" | "smali" | "smalltalk" | "smarty" | "sml"
    | "smlnj" | "solidity" | "sol" | "solution-file" | "sln" | "soy"
    | "splunk-spl" | "sqf" | "squirrel" | "stan" | "stata" | "iecst"
    | "supercollider" | "sclang" | "swift" | "systemd" | "tact" | "t4-templating"
    | "t4-cs" | "t4" | "vbnet" | "t4-vb" | "tap" | "tcl"
    | "tt2" | "toml" | "ttcn" | "ttcn3" | "ttcn-3" | "turtle"
    | "trickle" | "typescript-jsdoc" | "typoscript" | "tsconfig" | "unrealscript" | "uscript"
    | "uc" | "v" | "vala" | "vba" | "vbscript" | "velocity"
    | "verilog" | "vhdl" | "vim" | "visual-basic" | "vb" | "warpscript"
    | "wasm" | "web-idl" | "webidl" | "wgsl" | "wiki" | "wolfram"
    | "mathematica" | "nb" | "wl" | "xeora" | "xeoracube" | "xml-doc"
    | "xojo" | "xquery" | "yang" | "zig";

export type {
    JSX
}
