import {FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control'
import {Field, useField, useFormik} from "formik"
import {Input} from '@chakra-ui/input'

const TextField = ({label, ...props}) => {
    const [field, meta] = useField(props)
  return (
    <FormControl isInvalid={meta.touched && meta.error}>
        <FormLabel>{label}</FormLabel>
        <Input as={Field} {...field} {...props}/>
        <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
    )
}

export default TextField