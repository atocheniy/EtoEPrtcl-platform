import '../components/css/MainContainer.css'
import AuthHeader from '../components/auth/AuthLayout.tsx';
import Form from '../components/Form.tsx';

import AnimatedPage from '../components/AnimatedPage'; 

function LoginPage() {
  return (
    <AnimatedPage>
        <div className='mainContainer'>
        <AuthHeader 
            text="Нет аккаунта?" 
            buttonLabel="Зарегистрироваться" 
            navigateTo="/register"
        />
        <Form></Form>
        </div>
    </AnimatedPage>
  )
}

export default LoginPage