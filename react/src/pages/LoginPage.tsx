import '../components/css/MainContainer.css'
import AuthHeader from '../components/layout/AuthLayout.tsx';
import Form from '../components/features/Form.tsx';

import AnimatedPage from '../components/motion/AnimatedPage.tsx'; 

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