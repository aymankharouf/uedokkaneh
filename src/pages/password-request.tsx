import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { f7, Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { addPasswordRequest, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const PasswordRequest = () => {
  const { state } = useContext(StateContext)
  const [mobile, setMobile] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [error, setError] = useState('')
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
  const handlePasswordRequest = () => {
    try{
      if (state.passwordRequests.find(r => r.mobile === mobile)) {
        throw new Error('duplicatePasswordRequest')
      }
      addPasswordRequest(mobile)
      showMessage(labels.sendSuccess)
      f7.views.main.router.navigate('/home/')
      f7.panel.close('right')
    } catch (err){
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.passwordRequest} backLink={labels.back} />
      <List form>
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
      {!mobile || mobileErrorMessage ? '' : 
        <Button text={labels.send} large onClick={() => handlePasswordRequest()} />
      }
      </List>
    </Page>
  )
}
export default PasswordRequest
