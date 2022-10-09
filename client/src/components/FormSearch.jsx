import React, { useState, useContext } from 'react'
import { GlobalContext } from '../context/GlobalContext'
import { useHistory } from 'react-router-dom'
import Button from './Button'
import { capitalize } from '../util'
import UserApi from '../api/user'

const FormSearch = ({ btnText, style = null }) => {
  const global = useContext(GlobalContext)
  const history = useHistory()
  const [form, setForm] = useState({ pickup: '', destination: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleAutoDetect = () => {
    //if html5 geolocation api supports in browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        UserApi.getLocation(lat, lng)
          .then((res) => {
            setForm({ ...form, pickup: res.data.address.city })
          })
          .catch((err) => {
            global.setAlert({
              type: 'danger',
              message: err.response.data.message,
            })
          })
      })
    } else {
      global.setAlert({
        type: 'danger',
        message: 'Browser not supported',
      })
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!e.target.checkValidity()) {
      return
    }
    history.push(
      `/search?p=${capitalize(form.pickup)}&d=${capitalize(form.destination)}`
    )
  }
  const className =
    style == 'dark'
      ? 'border-gray focus-action-1 color-heading placeholder-main'
      : 'border-transparent-white focus-white color-white placeholder-transparent-white'
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='row align-items-center no-gutters'
      >
        <div className='position-relative px-0'>
          <i
            className='fas fa-crosshairs float-end mr-2 color-white f-24 locationDetect clickable'
            onClick={handleAutoDetect}
          ></i>
          <input
            value={form.pickup}
            type='text'
            name='pickup'
            placeholder='Pickup Point'
            required
            className={`input mb-15 w-full d-block text-center text-md-left text-capitalize ${className}`}
            onChange={handleChange}
          />
        </div>
        <input
          value={form.destination}
          type='text'
          name='destination'
          placeholder='destination'
          required
          className={`input mb-15 d-block text-center text-md-left text-capitalize ${className}`}
          onChange={handleChange}
        />
        <Button
          className='action-2 mx-auto w-250 text-center'
          text={btnText}
          type='submit'
        />
      </form>
    </>
  )
}

export default FormSearch
