import * as React from 'react'

export default function Login() {
    const userLogin = (event) => {
        console.log(document.getElementById("username").value)
        console.log(document.getElementById("password").value)
    }
    return (
        <div>
            <form>
                Enter your details to login or click fill in credentials and click register to be register.
                <input type="text" id="username" name="username" placeholder="username"></input>
                <input type="text" id="password" name="password" placeholder="password"></input>
                <button type="button" onClick={userLogin}>Login</button>
                <button type="button">Register</button>
            </form>
        </div>
    )
}
