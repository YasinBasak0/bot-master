import { SyntheticEvent } from 'react';

export interface TextareaProps {
  className?: string
  placeholder?: string
  isFocused?: boolean
  forceUpdateHeight?: boolean
  onChange: (value: string) => void
  onBlur?: () => void
  onKeyDown?: (e?: SyntheticEvent) => void
  value: string
}
