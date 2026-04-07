import '../components/css/MainContainer.css'
import RegisterForm from '../components/features/RegisterForm.tsx';
import AnimatedPage from '../components/motion/AnimatedPage.tsx'; 

import AuthHeader from '../components/layout/AuthLayout.tsx';

function RegisterPage() {
  return (
    <AnimatedPage>
      <div className='mainContainer'>
        <AuthHeader 
          text="Уже есть аккаунт?" 
          buttonLabel="Войти" 
          navigateTo="/login" 
        />
      <RegisterForm></RegisterForm>
      </div>
    </AnimatedPage>
  )
}

export default RegisterPage