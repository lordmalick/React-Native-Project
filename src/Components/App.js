import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin'
import axios from 'axios'
import async from 'async'
import moment from 'moment'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import MenuItem from 'material-ui/MenuItem'
import Card from 'material-ui/Card'
import DatePicker from 'material-ui/DatePicker'
import TimePicker from 'material-ui/TimePicker'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import SnackBar from 'material-ui/Snackbar'
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
  StepButton
} from 'material-ui/stepper'
import {
  RadioButton,
  RadioButtonGroup
} from 'material-ui/RadioButton'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton'
import logo from './../../assets/images/logo.svg'
const API_BASE = "http://localhost:8083/";

injectTapEventPlugin()
const HOST = PRODUCTION ? '/' : API_BASE
  class AppointmentApp extends React.Component {
 constructor() {
    super()
    this.state = {
      loading: false, 
      navOpen: false,
      confirmationModalOpen: false,
      confirmationTextVisible: false,
      stepIndex: 0,
      appointmentDateSelected: false,
      appointmentMeridiem: 0,
      EmailValide: true,
      PhoneValide: true,
      smallScreen: window.innerWidth < 768,
      confirmationSnackbarOpen: false,
      programme: [], 
      reunionsProgramme:[], 
      datesFixes: {}, 
      fullDays: [] 
    }

    this.handleNavToggle = this.handleNavToggle.bind(this)
    this.handleNextStep = this.handleNextStep.bind(this)
    this.handleSetAppointmentDate = this.handleSetAppointmentDate.bind(this)
    this.handleSetAppointmentSlot = this.handleSetAppointmentSlot.bind(this)
    this.handleSetAppointmentMeridiem = this.handleSetAppointmentMeridiem.bind(this)
    this.handleSubmit = this.Submit.bind(this)
    this.validateEmail = this.validerEmail.bind(this)
    this.validatePhone = this.validerNphone.bind(this)
    this.checkDisableDate = this.checkDisableDate.bind(this)
    this.renderAppointmentTimes = this.renderTimes.bind(this)
    this.renderConfirmationString = this.renderConfirmation.bind(this)
    this.renderAppointmentConfirmation = this.renderAppointmentConfirmation.bind(this)
    this.resize = this.resize.bind(this)
  }

  handleNavToggle() {
    return this.setState({ navOpen: !this.state.navOpen })
  }

  handleNextStep() {
    const { stepIndex } = this.state
    return (stepIndex < 3) ? this.setState({ stepIndex: stepIndex + 1}) : null
  }

  handleSetAppointmentDate(date) {
    this.handleNextStep()
    this.setState({ appointmentDate: date, confirmationTextVisible: true })
  }

  handleSetAppointmentSlot(slot) {
    this.handleNextStep()
    this.setState({ appointmentSlot: slot })
  }

  handleSetAppointmentMeridiem(meridiem) {
    this.setState({ appointmentMeridiem: meridiem})
  }

  handleFetch(response) {
    const { configs, appointments } = response
    const initProg = {}
    const today = moment().startOf('day')
    initProg[today.format('DD-MM-YYYY')] = true
    const programme = !appointments.length ? initProg : appointments.reduce((progEnCours, appointment) => {
      const { date, slot } = appointment
      const dateChaine = moment(date, 'YYYY-DD-MM').format('YYYY-DD-MM')
      !progEnCours[date] ? progEnCours[dateChaine] = Array(8).fill(false) : null
      Array.isArray(progEnCours[dateChaine]) ?
        progEnCours[dateChaine][slot] = true : null
      return progEnCours
    }, initProg)

    for (let jour in programme) {
      let slots = programme[jour]
      slots.length ? (slots.every(slot => slot === true)) ? programme[jour] = true : null : null
    }

    this.setState({
      programme,
      siteTitle: configs.site_title,
      aboutPageUrl: configs.about_page_url,
      contactPageUrl: configs.contact_page_url,
      homePageUrl: configs.home_page_url,
      loading: false
    })
  }

  handleFetchError(err) {
    console.log(err)
    this.setState({ confirmationSnackbarMessage: 'Erreur lors du chargement des données', confirmationSnackbarOpen: true })
  }

  Submit() {
    const appointment = {
      date: moment(this.state.appointmentDate).format('YYYY-DD-MM'),
      slot: this.state.appointmentSlot,
      name: this.state.firstName + ' ' + this.state.lastName,
      email: this.state.email,
      phone: this.state.phone
    }
    axios.post(HOST + 'api/appointments', appointment)
    .then(response => this.setState({ confirmationSnackbarMessage: "Reunion Crée avec succées!", confirmationSnackbarOpen: true, processed: true }))
    .catch(err => {
      console.log(err)
      return this.setState({ confirmationSnackbarMessage: "Echec Lors de La Creation.", confirmationSnackbarOpen: true })
    })
  }

  validerEmail(email) {
    const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    return regex.test(email) ? this.setState({ email: email, EmailValide: true }) : this.setState({ EmailValide: false })
  }

  validerNphone(phoneNumber) {
    const regex = /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/
    return regex.test(phoneNumber) ? this.setState({ phone: phoneNumber, validPhone: true }) : this.setState({ validPhone: false })
  }

  checkDisableDate(jour) {
    const dateString = moment(jour).format('YYYY-DD-MM')
    return this.state.fullDays.includes(dateString);
  }

  renderConfirmation() {
    const spanStyle = {color: '#00bcd4'}
    return this.state.confirmationTextVisible ? <h2 style={{ textAlign: this.state.smallScreen ? 'center' : 'left', color: '#bdbdbd', lineHeight: 1.5, padding: '0 10px', fontFamily: 'Roboto'}}>
      { <span>
        Scheduling a

          <span style={spanStyle}> 1 hour </span>

        appointment {this.state.appointmentDate && <span>
          on <span style={spanStyle}>{moment(this.state.appointmentDate).format('dddd[,] MMMM Do')}</span>
      </span>} {Number.isInteger(this.state.appointmentSlot) && <span>at <span style={spanStyle}>{moment().hour(9).minute(0).add(this.state.appointmentSlot, 'heure').format('h:mm a')}</span></span>}
      </span>}
    </h2> : null
  }

  renderTimes() {
    if (!this.state.loading) {
      const slots = [...Array(8).keys()]
      return slots.map(slot => {
        const appointmentDateString = moment(this.state.appointmentDate).format('YYYY-DD-MM')
        const t1 = moment().hour(9).minute(0).add(slot, 'hours')
        const t2 = moment().hour(9).minute(0).add(slot + 1, 'hours')
        const reunionAnnulé = this.state.programme[appointmentDateString] ? this.state.programme[moment(this.state.appointmentDate).format('YYYY-DD-MM')][slot] : false
        const meridiemDesactivé = this.state.appointmentMeridiem ? t1.format('a') === 'am' : t1.format('a') === 'pm'
        let slotFilled;   
        for (let bookedDay in this.state.datesFixes) {
          let obj = this.state.datesFixes[bookedDay];
          (bookedDay === appointmentDateString) && (slotFilled = Object.values(obj).map(Number).includes(slot));
        }
        return <RadioButton
          label={t1.format('h:mm a') + ' - ' + t2.format('h:mm a')}
          key={slot}
          value={slot}
          style={{marginBottom: 15, display: meridiemDesactivé ? 'none' : 'inherit'}}
          disabled={reunionAnnulé || meridiemDesactivé || slotFilled}/>
      })
    } else {
      return null
    }
  }

  renderAppointmentConfirmation() {
    const spanStyle = { color: '#00bcd4' }
    return <section>
      <p>Name: <span style={spanStyle}>{this.state.firstName} {this.state.lastName}</span></p>
      <p>Number: <span style={spanStyle}>{this.state.phone}</span></p>
      <p>Email: <span style={spanStyle}>{this.state.email}</span></p>
      <p>Rendez-Vous: <span style={spanStyle}>{moment(this.state.appointmentDate).format('dddd[,] MMMM Do[,] YYYY')}</span> at <span style={spanStyle}>{moment().hour(9).minute(0).add(this.state.appointmentSlot, 'hours').format('h:mm a')}</span></p>
    </section>
  }

  resize() {
    this.setState({ smallScreen: window.innerWidth < 768 })
  }

  componentDidMount() {
    const saveResults = async() => {
      const appointments = await axios.get(HOST + 'api/appointments');
      const appointmentData = appointments.data.data;
      this.setState({bookedAppointments: appointmentData});

      let joursPrg=[];
      let dateObj = {};
      let slots = []
      appointmentData.map(appointment=>{return (!joursPrg.includes(appointment.date)) && (joursPrg.push(appointment.date),slots.push(appointment.slot))})
      joursPrg.map(bookedDate => {
        let newArray=[]
        appointmentData.map(appointment=>{ return (appointment.date === bookedDate) && newArray.push(appointment.slot)})
        return dateObj[bookedDate] = newArray
      })
      for (let bookedDay in dateObj) {
        let obj = dateObj[bookedDay];
        (obj.length === 8) && this.setState({fullDays: [...this.state.fullDays, bookedDay]});
      }
      this.setState({bookedDatesObject: dateObj});
      const config = await axios.get(HOST + 'api/config');
      const configData = config.data.data;      
      return {appointmentData, configData};
    }

    saveResults()
    .then(result => {this.handleFetch(result)})
    .catch(err=>this.handleFetchError(err));

    addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    removeEventListener('resize', this.resize)
  }

  render() {
    const { stepIndex, loading, navOpen, smallScreen, confirmationModalOpen, confirmationSnackbarOpen, ...data } = this.state
    const contactFormFilled = data.firstName && data.lastName && data.phone && data.email && data.PhoneValide && data.EmailValide
    const modalActions = [
      <FlatButton
        label="Annuler"
        primary={false}
        onClick={() => this.setState({ confirmationModalOpen : false})} />,
      <FlatButton
        label="Confirmer"
        primary={true}
        onClick={() => this.Submit()} />
    ]
    return (
      <div>
        <AppBar
          title={data.siteTitle}
          onLeftIconButtonTouchTap={() => this.handleNavToggle() }/>
        <Drawer
          docked={false}
          width={300}
          open={navOpen}
          onRequestChange={(navOpen) => this.setState({navOpen})} >
          <img src={logo}
               style={{
                 height: 70,
                 marginTop: 50,
                 marginBottom: 30,
                 marginLeft: '50%',
                 transform: 'translateX(-50%)'
               }}/>
          <a style={{textDecoration: 'none'}} href={this.state.homePageUrl}><MenuItem>Home</MenuItem></a>
          <a style={{textDecoration: 'none'}} href={this.state.aboutPageUrl}><MenuItem>About</MenuItem></a>
          <a style={{textDecoration: 'none'}} href={this.state.contactPageUrl}><MenuItem>Contact</MenuItem></a>

          <MenuItem disabled={true}
                    style={{
                      marginLeft: '50%',
                      transform: 'translate(-50%)'
                    }}>
            {"© Copyright " + moment().format('YYYY')}</MenuItem>
        </Drawer>
        <section style={{
            maxWidth: !smallScreen ? '80%' : '100%',
            margin: 'auto',
            marginTop: !smallScreen ? 20 : 0,
          }}>
          {this.renderConfirmation()}
          <Card style={{
              padding: '10px 10px 25px 10px',
              height: smallScreen ? '100vh' : null
            }}>
            <Stepper
              activeStep={stepIndex}
              linear={false}
              orientation="vertical">
              <Step disabled={loading}>
                <StepButton onClick={() => this.setState({ stepIndex: 0 })}>
                Choisissez un jour disponible pour une Reunion
                </StepButton>
                <StepContent>
                  <DatePicker
                      style={{
                        marginTop: 10,
                        marginLeft: 10
                      }}
                      value={data.appointmentDate}
                      hintText="Choisir une Date"
                      mode={smallScreen ? 'portrait' : 'landscape'}
                      onChange={(n, date) => this.handleSetAppointmentDate(date)}
                      shouldDisableDate={day => this.checkDisableDate(day)}
                      minDate={new Date()}
                       />
                  </StepContent>
              </Step>
              <Step disabled={ !data.appointmentDate }>
                <StepButton onClick={() => this.setState({ stepIndex: 1 })}>
                  Choose an available time for your appointment
                </StepButton>
                <StepContent>
                  <SelectField
                    floatingLabelText="AM or PM"
                    value={data.appointmentMeridiem}
                    onChange={(evt, key, payload) => this.handleSetAppointmentMeridiem(payload)}
                    selectionRenderer={value => value ? 'PM' : 'AM'}>
                    <MenuItem value={0}>AM</MenuItem>
                    <MenuItem value={1}>PM</MenuItem>
                  </SelectField>
                  <RadioButtonGroup
                    style={{ marginTop: 15,
                             marginLeft: 15
                           }}
                    name="appointmentTimes"
                    defaultSelected={data.appointmentSlot}
                    onChange={(evt, val) => this.handleSetAppointmentSlot(val)}>
                    {this.renderTimes()}
                  </RadioButtonGroup>
                </StepContent>
              </Step>
              <Step disabled={ !Number.isInteger(this.state.appointmentSlot) }>
                <StepButton onClick={() => this.setState({ stepIndex: 2 })}>
                  Share your contact information with us and we'll send you a reminder
                </StepButton>
                <StepContent>
                  <section>
                    <TextField
                      style={{ display: 'block' }}
                      name="nom"
                      hintText="Nom "
                      floatingLabelText="Nom"
                      onChange={(evt, newValue) => this.setState({ firstName: newValue })}/>
                    <TextField
                      style={{ display: 'block' }}
                      name="prenom"
                      hintText="Prenom"
                      floatingLabelText="Prenom"
                      onChange={(evt, newValue) => this.setState({ lastName: newValue })}/>
                    <TextField
                      style={{ display: 'block' }}
                      name="email"
                      hintText="exemple@email.com"
                      floatingLabelText="Email"
                      errorText={data.EmailValide ? null : 'Entrer une adresse email Valide'}
                      onChange={(evt, newValue) => this.validerEmail(newValue)}/>
                    <TextField
                      style={{ display: 'block' }}
                      name="phone"
                      floatingLabelText="Numero"
                      errorText={data.PhoneValide ? null: 'Entrer un Numero Valide'}
                      onChange={(evt, newValue) => this.validerNphone(newValue)} />
                    <RaisedButton
                      style={{ display: 'block' }}
                      label={contactFormFilled ? 'Programmer une Reunion' : 'Remplissez les informations'}
                      labelPosition="before"
                      primary={true}
                      fullWidth={true}
                      onClick={() => this.setState({ confirmationModalOpen: !this.state.confirmationModalOpen })}
                      disabled={!contactFormFilled || data.processed }
                      style={{ marginTop: 20, maxWidth: 100}} />
                  </section>
                </StepContent>
              </Step>
            </Stepper>
          </Card>
          <Dialog
            modal={true}
            open={confirmationModalOpen}
            actions={modalActions}
            title="Confirmer la reunion">
            {this.renderAppointmentConfirmation()}
          </Dialog>
          <SnackBar
            open={confirmationSnackbarOpen || loading}
            message={loading ? 'progression... ' : data.confirmationSnackbarMessage || ''}
            autoHideDuration={10000}
            onRequestClose={() => this.setState({ confirmationSnackbarOpen: false })} />
        </section>
      </div>
    )
  }
}

