import { useEffect, useState } from "react"
import { Post } from "../components/Post"
import axios from "axios"



export default function UserPost() {
const [posts, setPosts] = useState([])
    useEffect(() => {
        axios.get("https://uni-networking-app.onrender.com/api/v1/post/all").then((response) => {
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
