import React, { useState } from 'react';
import styles from './Subscribe.module.scss';

import addToMailchimp from 'gatsby-plugin-mailchimp'

const SubscribeForm = (title) => {
    const [email, setEmail] = useState('');
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [subscribeResponse, setSubscribeResponse] = useState('')
  
    const _handleSubmit = e => {
        const listFields = {
            PATHNAME: title,
            FNAME: firstName,
            LNAME: lastName
        }
        e.preventDefault()
        addToMailchimp(email, listFields)
        .then(data => {
         console.log(data)
            if(data.result === 'error') {
                if(data.msg.includes('already subscribed')) {
                    setSubscribeResponse(`Yay! you are already subscribed`)
                } else {
                    setSubscribeResponse('Avocados went bad! Sorry try again..')
                }
            }
            else { 
                setSubscribeResponse('Hey there, You are all set! Look out for the next post')
            }
            setEmail('');
            setfirstName('');
            setlastName('');
        })
        .catch((err) => {
            console.log(err)
            setEmail('');
            setfirstName('');
            setlastName('');
        })
    }
  
    const handleEmailChange = (e) => {
      const {name, value} = e.target;
      setEmail(value);
    }

    const handleFirstNameChange = (e) => {
      const {value} = e.target;
      setfirstName(value);
    }

    const handleLastNameChange = (e) => {
      const {value} = e.target;
      setlastName(value);
    }

    return(
        <div className={styles['Sidebar-subscribe']}>
            <p> <b>Subscribe to stay updated on my latest posts</b></p>
            <input 
                type="text" 
                name="firstName" 
                className= {styles["Sidebar-subscribe-input"]} 
                onChange={handleFirstNameChange}
                placeholder="First Name"
                value={firstName}
            />
            <input 
                type="text" 
                name="lastName" 
                className= {styles["Sidebar-subscribe-input"]} 
                onChange={handleLastNameChange}
                placeholder="Last Name"
                value={lastName}
            />
            <input 
                type="text" 
                name="email" 
                className= {styles["Sidebar-subscribe-input"]} 
                onChange={handleEmailChange}
                placeholder="Your email address"
                value={email}
            />
            <button type="button" disabled={!email} onClick={_handleSubmit}> Subscribe!</button>
            {subscribeResponse && <p className="Sidebar-subscribe-response">{subscribeResponse}</p>}
        </div>
      )
  }

  export default SubscribeForm;