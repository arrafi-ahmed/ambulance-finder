import React, { useState, useEffect, useContext, useRef } from 'react'
import { GlobalContext } from '../context/GlobalContext'
import { Link, useHistory } from 'react-router-dom'
import Section from '../components/Section'
import PageTitle from '../components/PageTitle'
import Button from '../components/Button'
import BookingStatus from '../components/BookingStatus'
import UserApi from '../api/user'

const Dashboard = () => {
  const global = useContext(GlobalContext)
  const history = useHistory()

  const [user, setUser] = useState({})
  const [location, setLocation] = useState({ city: '', country: '' })
  const license_photo = useRef()

  const getUser = () => {
    UserApi.getUserLastLocation()
      .then((res) => {
        setUser(res.data)
        setLocation({ city: res.data.city, country: res.data.country })
      })
      .catch((err) => {
        global.setAlert({ type: 'danger', message: err.response.data.message })
      })
  }
  const getGreeting = () => {
    if (user.type) {
      const name = user.first_name || user.phone
      const hour = new Date().getHours()
      if (hour < 5) {
        return 'Good Night ' + name
      } else if (hour < 12) {
        return 'Good Morning ' + name
      } else if (hour < 17) {
        return 'Good Afternoon ' + name
      } else if (hour < 24) {
        return 'Good Evening ' + name
      }
    }
  }
  const handleUploadChange = () => {
    license_photo.current.click()
  }
  const handleUploadSubmit = () => {
    const formData = new FormData()
    formData.append('license_photo', license_photo.current.files[0])
    UserApi.uploadLicense(formData)
      .then((res) => {
        global.setAlert({ type: 'success', message: res.data.message })
        history.push(`/dashboard`)
      })
      .catch((err) => {
        global.setAlert({
          type: 'danger',
          message: err.response.data.message,
        })
      })
  }
  const handleChange = (e) => {
    setLocation({ ...location, [e.target.name]: e.target.value })
  }
  const handleAutoDetect = () => {
    //if html5 geolocation api supports in browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        UserApi.getLocation(lat, lng)
          .then((res) => {
            setLocation({
              city: res.data.address.city,
              country: res.data.address.country,
            })
          })
          .catch((err) => {
            global.setAlert({
              type: 'danger',
              message: err.response.data.message,
            })
          })
      })
    } else {
      console.log('Browser dont support')
    }
  }
  const handleUpdateLocation = () => {
    const locationData = {
      city: location.city,
      country: location.country,
    }
    UserApi.updateLocation(locationData)
      .then((res) => {
        global.setAlert({ type: 'success', message: res.data.message })
      })
      .catch((err) => {
        global.setAlert({
          type: 'danger',
          message: err.response.data.message,
        })
      })
  }
  useEffect(() => {
    getUser()
  }, [])
  return (
    <>
      <Section className='bg-light' align='center'>
        <PageTitle title={getGreeting()} />

        {/* driver notifications */}
        <>
          {user.type == 1 && !user.approved && (
            <div className='text-center mt-2 mb-5'>
              <span className='h5 block radius10 alert alert-danger'>
                Your account is not approved yet, adding vehicle not allowed!
              </span>
            </div>
          )}
          {user.type == 1 && user.license_photo == null && (
            <div className='text-center mt-2 mb-5'>
              <span className='h5 block radius10 alert alert-danger'>
                Driving license not uploaded yet! &nbsp;
                <input
                  type='file'
                  style={{ display: 'none' }}
                  ref={license_photo}
                  name='license_photo'
                />
                <button
                  className='btn action-1 sm mt-n2'
                  onClick={handleUploadChange}
                >
                  Select image
                </button>
                <button
                  className='btn action-2 sm ml-5 mt-n2'
                  onClick={handleUploadSubmit}
                >
                  Upload now
                </button>
              </span>
            </div>
          )}
        </>

        <div className='row justify-content-center'>
          <div className='col-lg-5 block radius10 text-center py-3 '>
            <h4 className='py-3'>Update Current Location</h4>
            <div className='position-relative px-0'>
              <i
                class='fas fa-crosshairs float-end mr-2 f-24 locationDetect clickable'
                onClick={handleAutoDetect}
              ></i>
              <input
                value={location.city}
                onChange={handleChange}
                type='text'
                name='city'
                placeholder='City'
                required='required'
                className='input w-full mb-2 border-gray focus-action-1 color-heading placeholder-main text-center text-md-left'
              />
            </div>
            <input
              value={location.country}
              onChange={handleChange}
              type='text'
              name='country'
              placeholder='Country'
              required='required'
              className='input w-full mb-2 border-gray focus-action-1 color-heading placeholder-main text-center text-md-left'
            />
            <div className='d-inline-flex my-2'>
              <Button
                className='action-2'
                link='# '
                text='Change Location'
                type='submit'
                event={handleUpdateLocation}
              />
            </div>
          </div>
          <div className='col-lg-5 block radius10 text-center py-3 ml-0 ml-lg-2'>
            <h4 className='py-3'>Current Booking</h4>
            {(user.last_booking && (
              <>
                <div className='text-center'>
                  <div className='d-block'>
                    <h5>
                      <b>Status: </b>
                      <BookingStatus status={user.last_booking.status} />
                    </h5>
                  </div>
                  <div className='d-block pt-2'>
                    <b>ID: </b>
                    <Link
                      to={`/booking/${user.last_booking._id}`}
                      className='text-decoration-underline'
                    >
                      {user.last_booking._id}
                    </Link>
                  </div>
                  <div className='d-block pt-2'>
                    <b>Pickup: </b> {user.last_booking.pickup}
                  </div>
                  <div className='d-block pt-2'>
                    <b>Destination: </b> {user.last_booking.destination}
                  </div>
                  <div className='d-block pt-2'>
                    <b>Time: </b>{' '}
                    {user.last_booking.createdAt
                      .slice(0, 19)
                      .replace('T', ' | ')}
                  </div>
                </div>
              </>
            )) || <h5>No booking found</h5>}
          </div>
        </div>
      </Section>
    </>
  )
}

export default Dashboard