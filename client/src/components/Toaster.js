import React, { useEffect } from 'react'
import { useToasts } from 'react-toast-notifications';


const FormWithToasts = (props) => {
    const { addToast } = useToasts();
   
    useEffect(() => {
        if(props.error)
        addToast(props.error, { appearance: 'error' });
    }, [props.error])

    useEffect(() => {
        if(props.success)
        addToast(props.success, { appearance: 'success' });
    }, [props.success])
  
    return (<></>);
  };

  export default FormWithToasts