import { useEffect, useState } from "react"
import { Post } from "../components/Post"
import axios from "axios"
import dotenv from 'dotenv';
dotenv.config();



export default function UserPost() {
const [posts, setPosts] = useState([])
    useEffect(() => {
        axios.get(`${process.env.BASE_API_URL}/post/all`).then((response) => {
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
