import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Control } from 'react-hook-form'
import { AddressFormValues, AreaItem } from '@/types/address'

interface AddressFormFieldProps {
  control: Control<AddressFormValues>
  name: keyof AddressFormValues
  label: string
  placeholder: string
  type?: 'text' | 'textarea' | 'select'
  disabled?: boolean
  options?: AreaItem[]
  onValueChange?: (code: string) => void
}

export function AddressFormField({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  options,
  onValueChange,
}: AddressFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-gray-700 font-semibold text-sm'>
            {label}
          </FormLabel>
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                {...field}
                className='bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg min-h-[120px]'
              />
            ) : type === 'select' ? (
              <Select
                disabled={disabled}
                onValueChange={(code) => {
                  if (onValueChange) {
                    onValueChange(code)
                  }
                }}>
                <SelectTrigger className='w-full bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg'>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                className='bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg'
              />
            )}
          </FormControl>
          <FormMessage className='text-red-500 text-sm mt-1' />
        </FormItem>
      )}
    />
  )
}
