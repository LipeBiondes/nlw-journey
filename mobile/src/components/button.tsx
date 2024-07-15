import { createContext, useContext } from 'react'

import {
  Text,
  TextProps,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet
} from 'react-native'
import clsx from 'clsx'

type Variants = 'primary' | 'secondary'

type ButtonProps = TouchableOpacityProps & {
  variant?: Variants
  isLoading?: boolean
}

const ThemeContext = createContext<{ variant?: Variants }>({})

function Button({
  variant = 'primary',
  children,
  isLoading,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      activeOpacity={0.7}
      disabled={isLoading}
      {...rest}
    >
      <ThemeContext.Provider value={{ variant }}>
        {isLoading ? <ActivityIndicator className="text-lime-950" /> : children}
      </ThemeContext.Provider>
    </TouchableOpacity>
  )
}

function Title({ children }: TextProps) {
  const { variant } = useContext(ThemeContext)

  return (
    <Text
      className={clsx('text-base font-semibold', {
        'text-lime-950': variant === 'primary',
        'text-zinc-200': variant === 'secondary'
      })}
    >
      {children}
    </Text>
  )
}

Button.Title = Title

const styles = StyleSheet.create({
  button: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16
  },
  primary: {
    backgroundColor: '#bef264'
  },
  secondary: {
    backgroundColor: '#27272a'
  }
})

export { Button }
