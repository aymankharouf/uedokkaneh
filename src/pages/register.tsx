import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { f7, Page, Navbar, List, ListInput, Button, ListItem } from 'framework7-react'
import { registerUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

type Props = {
  type: string
}
const StoreOwner = (props: Props) => {
  const { state } = useContext(StateContext)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [regionId, setRegionId] = useState('')
  const [nameErrorMessage, setNameErrorMessage] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [storeNameErrorMessage, setStoreNameErrorMessage] = useState('')
  const [regions] = useState(() => [...state.regions].sort((l1, l2) => l1.ordering - l2.ordering))
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
      password: /^.{4}$/,
    }
    const validatePassword = (value: string) => {
      if (patterns.password.test(value)){
        setPasswordErrorMessage('')
      } else {
        setPasswordErrorMessage(labels.invalidPassword)
      }
    }
    if (password) validatePassword(password)
  }, [password])
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
    useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  useEffect(() => {
    const patterns = {
      name: /^.{4,50}$/,
    }
    const validateStoreName = (value: string) => {
      if (patterns.name.test(value)){
        setStoreNameErrorMessage('')
      } else {
        setStoreNameErrorMessage(labels.invalidName)
      }
    }  
    if (storeName) validateStoreName(storeName)
  }, [storeName])

  const handleRegister = async () => {
    try{
      setInprocess(true)
      await registerUser(mobile, name, storeName, regionId, password)
      setInprocess(false)
      showMessage(labels.registerSuccess)
      f7.views.current.router.back()
      f7.panel.close('right') 
    } catch (err){
      setInprocess(false)
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.newUser} backLink={labels.back} />
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
        <ListInput
          label={labels.password}
          type="number"
          placeholder={labels.passwordPlaceholder}
          name="password"
          clearButton
          value={password}
          errorMessage={passwordErrorMessage}
          errorMessageForce
          onChange={e => setPassword(e.target.value)}
          onInputClear={() => setPassword('')}
        />
        {props.type === 'o' ? 
          <ListInput
            label={labels.storeName}
            type="text"
            placeholder={labels.namePlaceholder}
            name="storeName"
            clearButton
            value={storeName}
            errorMessage={storeNameErrorMessage}
            errorMessageForce
            onChange={e => setStoreName(e.target.value)}
            onInputClear={() => setStoreName('')}
          />
        : ''}
        <ListItem
          title={labels.region}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="regionId" value={regionId} onChange={e => setRegionId(e.target.value)}>
            <option value=""></option>
            {regions.map(r => 
              <option key={r.id} value={r.id}>{r.name}</option>
            )}
          </select>
        </ListItem>
      </List>
      {!name || !mobile || !password || !regionId || (props.type === 'o' && !storeName) || nameErrorMessage || mobileErrorMessage || passwordErrorMessage || storeNameErrorMessage ? '' :
        <Button text={labels.register} large onClick={() => handleRegister()} />
      }
    </Page>
  )
}
export default StoreOwner
