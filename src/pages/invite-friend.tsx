import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { inviteFriend, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const InviteFriend = () => {
  const { state } = useContext(StateContext)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [nameErrorMessage, setNameErrorMessage] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    const patterns = {
      name: /^.{4,50}$/,
    }
    const validateName = (value: string) => {
      if (patterns.name.test(value)){
        setNameErrorMessage('')
      } else {
        setNameErrorMessage(labels.invalidName)
      }
    }  
    if (name) validateName(name)
  }, [name])
  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value: string) => {
      if (patterns.mobile.test(value)){
        setMobileErrorMessage('')
      } else {
        setMobileErrorMessage(labels.invalidMobile)
      }
    }
    if (mobile) validateMobile(mobile)
  }, [mobile])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSend = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (state.userInfo?.friends?.find(f => f.mobile === mobile)) {
        throw new Error('duplicateInvitation')
      }
      if (mobile === state.userInfo?.mobile) {
        throw new Error('invalidMobile')
      }
      inviteFriend(mobile, name)
      showMessage(labels.sendSuccess)
      f7.views.current.router.back()
    } catch (err){
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.inviteFriend} backLink={labels.back} />
      <List form>
        <ListInput
          label={labels.name}
          type="text"
          placeholder={labels.namePlaceholder}
          name="name"
          clearButton
          value={name}
          errorMessage={nameErrorMessage}
          errorMessageForce
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput
          label={labels.mobile}
          type="number"
          placeholder={labels.mobilePlaceholder}
          name="mobile"
          clearButton
          value={mobile}
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={e => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
      </List>
      <List>
      {!name || !mobile || nameErrorMessage || mobileErrorMessage ? '' : 
        <Button text={labels.send} onClick={() => handleSend()} />
      }
      </List>
    </Page>
  )
}
export default InviteFriend
