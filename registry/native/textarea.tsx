import * as React from "react"
import { TextInput } from "react-native"

import { fieldProps, useField, type InputProps } from "@/components/glass/native/input"

/**
 * A multi-line filled field that grows with its text from `minHeight` (96pt) up to `maxRows`
 * lines (10, like the web) or `maxHeight`, then scrolls.
 */
function Textarea({ style, onContentSizeChange, minHeight = 96, maxHeight, maxRows = 10, ...rest }: InputProps & { minHeight?: number; maxHeight?: number; maxRows?: number }) {
  const [own, props] = fieldProps(rest)
  const f = useField(own)
  const [content, setContent] = React.useState(0)
  const cap = Math.min(maxHeight ?? Infinity, maxRows * Math.round(f.ui.text.base * 1.4) + 30)
  const height = Math.min(cap, Math.max(minHeight, content + 24 + 6))
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      {...f.props}
      onContentSizeChange={(e) => {
        setContent(e.nativeEvent.contentSize.height)
        onContentSizeChange?.(e)
      }}
      scrollEnabled={height >= cap}
      style={[f.style, { paddingTop: 12, paddingBottom: 12, height }, style]}
      {...props}
    />
  )
}

export { Textarea }
