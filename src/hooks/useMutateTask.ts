import { Task } from "../types";
import axios from "axios";
import useStore from "../store";
import { useError } from "./useError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMutateTask = () => {
    const queryClient = useQueryClient()
    const { switchErrorHandling } = useError()
    const resetEditedTask = useStore((state) => state.resetEditedTask)

    // id,created_at,updated_atを取り除いた値でpostリクエスト、キャッシュ情報を読み込み更新されている場合は上書きをする
    const createTaskMutation = useMutation(
        (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
            axios.post<Task>(`${process.env.REACT_APP_API_URL}/tasks`, task),
        {
            onSuccess: (res) => {
                const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
                if (previousTasks) {
                    queryClient.setQueriesData(['tasks'], [...previousTasks, res.data])
                }
                resetEditedTask()
            },
            onError: (err: any) => {
                if(err.response.data.message) {
                    switchErrorHandling(err.response.data.message)
                } else {
                    switchErrorHandling(err.response.data)
                }
            }
        }
    )
    // taskの更新を行い、更新できた場合はIDに日もずくタスク情報を上書きする
    const updateTaskMutation = useMutation(
        (task: Omit<Task, 'created_at' | 'updated_at'>) =>
          axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task.id}`, {
            title: task.title,
          }),
        {
          onSuccess: (res, variables) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
              queryClient.setQueryData<Task[]>(
                ['tasks'],
                previousTasks.map((task) =>
                  task.id === variables.id ? res.data : task
                )
              )
            }
            resetEditedTask()
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
      // 削除処理を行い、削除できた場合はキャッシュのtask配列に対してfilterで削除したIDを取り除いて表示する
      const deleteTaskMutation = useMutation(
        (id: number) =>
          axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`),
        {
          onSuccess: (_, variables) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
              queryClient.setQueryData<Task[]>(
                ['tasks'],
                previousTasks.filter((task) => task.id !== variables)
              )
            }
            resetEditedTask()
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
      return {
        createTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,
      }
}