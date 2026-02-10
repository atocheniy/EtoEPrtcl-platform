import '../components/css/MainContainer.css'
import RegisterForm from '../components/RegisterForm.tsx';
import AnimatedPage from '../components/AnimatedPage'; 

import AuthHeader from '../components/auth/AuthLayout.tsx';

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