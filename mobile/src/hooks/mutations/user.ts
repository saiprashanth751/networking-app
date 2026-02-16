import { authService } from "@/api/auth";
import { AuthResponse, SigninInput, SignupInput } from "@/types/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";



export const useSignup = (
  options?: UseMutationOptions<AuthResponse, Error, SignupInput>
) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        navigate('/verify');
      }
    },
    ...options,
  });
};

export const useSignin = (
  options?: UseMutationOptions<AuthResponse, Error, SigninInput>
) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.signin,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        navigate('/createprofile');
      }
    },
    ...options,
  });
};
