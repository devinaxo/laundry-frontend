import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || props.defaultValue || "")
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => inputRef.current!)

    const handleIncrement = () => {
      if (inputRef.current) {
        inputRef.current.stepUp()
        const newValue = inputRef.current.value
        setValue(newValue)
        const event = new Event('input', { bubbles: true })
        inputRef.current.dispatchEvent(event)
      }
    }

    const handleDecrement = () => {
      if (inputRef.current) {
        inputRef.current.stepDown()
        const newValue = inputRef.current.value
        setValue(newValue)
        const event = new Event('input', { bubbles: true })
        inputRef.current.dispatchEvent(event)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }

    if (type === "number") {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input text-foreground bg-background/50 px-3 py-1 pr-8 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              className
            )}
            ref={inputRef}
            value={value}
            onChange={handleChange}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              className="flex-1 flex items-center justify-center px-2 text-muted-foreground hover:text-foreground transition-colors rounded-tr-md hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={props.disabled}
              tabIndex={-1}
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="flex-1 flex items-center justify-center px-2 text-muted-foreground hover:text-foreground transition-colors rounded-br-md hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={props.disabled}
              tabIndex={-1}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input text-foreground bg-background/50 px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
