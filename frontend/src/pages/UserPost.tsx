import { useEffect, useState } from "react"
import { Post } from "../components/Post"
import axios from "axios"

export default function UserPost() {
const [posts, setPosts] = useState([])
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_API_URL}/post/all`).then((response) => {
            setPosts(response.data.posts)
        })
    })

  return (
    <>
    <div>
        {posts?.map((post) => {
           return <Post post={post}></Post>
        })}
    </div>
    </>
  )
}
