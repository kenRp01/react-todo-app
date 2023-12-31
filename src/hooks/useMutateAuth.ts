import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useStore from "../store";
import { Credential } from "../types";
import { useError } from '../hooks/useError'

export const useMutateAuth = () => {
    const navigate = useNavigate()
    const resetEditedTask = useStore((state) => state.resetEditedTask)
    const { switchErrorHandling } = useError()
    // login
    const loginMutation = useMutation(
        async (user: Credential) => 
        await axios.post(`${process.env.REACT_APP_API_URL}/login`, user),
        {
            onSuccess: () => {
                navigate('/todo')
            },
            onError: (err: any) => {
                if (err.response.data.message) {
                    // csrfエラーの場合はエラーメッセージが格納される箇所が違うので設定
                    switchErrorHandling(err.response.data.message)
                } else {
                    switchErrorHandling(err.response.data)
                }
            }
        }
    )
    // signup
    const registerMutation = useMutation(
        async (user: Credential) =>
            await axios.post(`${process.env.REACT_APP_API_URL}/signup`, user),
            {
                onError: (err: any) => {
                    if (err.response.data.message) {
                        switchErrorHandling(err.response.data.message)
                    } else {
                        switchErrorHandling(err.response.data)
                    }
                }
            }
    )
    // logout
    const logoutMutation = useMutation(
        async () => await axios.post(`${process.env.REACT_APP_API_URL}/logout`),
        {
            onSuccess: () => {
                resetEditedTask()
                navigate('/')
            },
            onError: (err: any) => {
                if (err.response.data.message) {
                    switchErrorHandling(err.response.data.message)
                } else {
                    switchErrorHandling(err.response.data)
                }
            },
        }
    )
    return { loginMutation, registerMutation, logoutMutation }
}