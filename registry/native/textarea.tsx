import * as React from "react"
import { TextInput } from "react-native"

import { useField, type InputProps } from "@/components/glass/native/input"

/** A multi-line filled field that grows with its text (from 96pt, up to `maxHeight`). */
function Textarea({ invalid, disabled, style, onFocus, onBlur, editable, onContentSizeChange, minHeight = 96, maxHeight, ...props }: InputProps & { minHeight?: number; maxHeight?: number }) {
  const f = useField({ invalid, disabled, onFocus, onBlur, editable })
  const [content, setContent] = React.useState(0)
  const height = Math.min(maxHeight ?? Infinity, Math.max(minHeight, content + 24 + 6))
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      {...f.props}
      onContentSizeChange={(e) => {
        setContent(e.nativeEvent.contentSize.height)
        onContentSizeChange?.(e)
      }}
      scrollEnabled={maxHeight != null && height >= maxHeight}
      style={[f.style, { paddingTop: 12, paddingBottom: 12, height }, style]}
      {...props}
    />
  )
}

export { Textarea }
