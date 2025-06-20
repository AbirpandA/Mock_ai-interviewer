import { Control, Controller, FieldValues,Path, } from "react-hook-form"
import {  FormControl,
  FormItem,
  FormLabel,
  FormMessage
 } from "./ui/form"
import { Input } from "./ui/input"

interface FormFieldProps<T extends FieldValues>{
    name:Path<T>;
    control:Control<T>;
    label:string;
    placeholder?:string;
    type:'text'|'email'|'password'|'file'


}

const Formfield = ({name,label,placeholder,control,type="text"}:FormFieldProps<T>) => (
     <Controller
          
          name={name}
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label">{label}</FormLabel>
              <FormControl>
                <Input  className="input" placeholder={placeholder} {...field} type={type} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
)

export default Formfield