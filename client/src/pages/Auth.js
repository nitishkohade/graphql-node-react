import React, {Component} from 'react';
import FormWithToasts from '../components/Toaster';
import AuthContext from '../context/auth-context';
import './auth.css'


class AuthPage extends Component {

    state = {
        isLogin: true,
        error: null,
        signupSuccess: null
    }

    static contextType = AuthContext
    
    constructor(props) {
        super(props)
        this.emailEl = React.createRef()
        this.passwordEl = React.createRef()
    }

    switchModeHandler = () => {
        this.setState(prevState => {
            return {isLogin: !prevState.isLogin}
        })
    }

    submitHandler = (event) => {
        event.preventDefault()
        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if(email.trim().length === 0 || password.trim().length === 0) {
            return
        }

        let requestBody = {
            query: `
                query {
                    login(email: "${email}", password: "${password}") {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        }

        if(!this.state.isLogin) {
            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {email: "${email}", password: "${password}"}) {
                            _id
                            email
                        }
                    }
                `
            }
        }
        
        
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw res.json()
            }
            return res.json()
        })
        .then(resData => {
            if(resData.data && resData.data.login) {
                const {token, userId, tokenExpiration} = resData.data.login
                this.context.login(token, userId, tokenExpiration)
            }
            if(resData.data && resData.data.createUser) {
                this.setState({
                    signupSuccess: "Successfully Registered! Please Login using your credentials",
                    error: null
                })
            }
        })
        .catch(async data => {
            const error = await data
            this.setState({
                error: error && error.errors && error.errors[0] && error.errors[0].message
            })
        })
    }
    render() {
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                <div className="form-control">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" ref={this.emailEl} />
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl} />
                </div>
                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'Signup' : 'Login'}</button>
                </div>
                {this.state.error 
                ? <FormWithToasts error={this.state.error} /> 
                : <FormWithToasts success={this.state.signupSuccess} />}
            </form>
        )
    }
}

export default AuthPage