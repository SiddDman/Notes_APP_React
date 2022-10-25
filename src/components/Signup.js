import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Signup = (props) => {

    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" })
    let navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (credentials.password === "")
            alert("Enter Password")
        else { //API CALL
            const { name, email, password } = credentials
            const response = await fetch(`http://localhost:5000/api/auth/createUser`, {
                method: 'POST', // POST
                headers: {
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify({ name: credentials.name, email: credentials.email, password: credentials.password })
                body: JSON.stringify({ name, email, password })
            });
            const json = await response.json()
            console.log(json)
            if (json.success) {
                //Save the auth token and redirect
                localStorage.setItem('token', json.authtoken)
                props.showAlert("Account created successfully!!", "success")
                navigate("/")
            } else {
                props.showAlert("Invalid Details", "danger")
            }
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }
    return (
        <div className='container mt-2'>
            <h2>Create an Account to use NotesApp</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" name="name" className="form-control" id="name" onChange={onChange} aria-describedby="emailHelp" />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" name="email" className="form-control" id="email" onChange={onChange} aria-describedby="emailHelp" />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" onChange={onChange} minLength={5} required id="password" />
                </div>
                <div className="mb-3">
                    <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                    <input type="password" name="cpassword" className="form-control" onChange={onChange} minLength={5} required id="cpassword" />
                </div>

                <div className="container" style={{ display: (credentials.password !== credentials.cpassword) && (credentials.password !== "" && credentials.cpassword) ? 'flex' : 'none' }}>
                    <strong style={{ color: 'red' }}>
                        <i className="fa-solid fa-circle-exclamation"></i> Those passwords didn’t match. Try again.
                    </strong>
                </div>
                <button type="submit" className="btn btn-primary my-4" disabled={credentials.password !== credentials.cpassword} onClick={handleSubmit}>
                    Submit</button>
            </form>
        </div>
    )
}

export default Signup