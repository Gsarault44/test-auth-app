import React, { Component } from 'react';

import app from 'firebase/app';
import * as ROLES from '../../constants/roles';
import { AuthUserContext } from '../Session';

const Form = React.forwardRef((onSubmit, introTitleRef, itemLabelRef, itemTextRef) => (
  <div>
    <h2>Company Form</h2>
    <form onSubmit={() => onSubmit} ref={introTitleRef}>
      <div>
        <label htmlFor='title'>title</label>
        <input type='text' id='title' placeholder='Title' ref={introTitleRef} />
      </div>
      <div>
        <label htmlFor='itemLabel'>Item Label</label>
        <input type='text' id='itemLabel' placeholder='Heading' ref={itemLabelRef} />
      </div>
      <div>
        <label htmlFor='itemText'>Item Text</label>
        <input type='text' id='itemText' placeholder='Context' ref={itemTextRef} />
      </div>
      <button type='submit'>Send</button>
    </form>
  </div>
));

class ReportIntro extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form1: [],
      alert: false,
      alertData: {}
    };
    this.myRef = React.createRef();
    this.db = app.database();
  }

  showAlert(type, message) {
    this.setState({
      alert: true,
      alertData: { type, message }
    });
    setTimeout(() => {
      this.setState({ alert: false });
    }, 4000)
  }

  resetForm() {
    this.refs.contactForm.reset();
  }

  componentDidMount() {
    let formRef = this.db.ref('form1').orderByKey().limitToLast(6);
    formRef.on('child_added', snapshot => {
      const { itemLabel, itemText } = snapshot.val();
      const data = { itemLabel, itemText };
      this.setState({ form1: [data].concat(this.state.form1) });
    })
  }

  sendMessage(e) {
    e.preventDefault();
    const params = {
      introTitle: this.inputIntroTitle.value,
      itemLabel: this.inputIntroLabel.value,
      introText: this.inputIntroText.value,
    };
    if (params.introTitle) {
      this.db.ref('form1').push(params).then(() => {
        this.showAlert('success', 'Your message was sent successfull');
      }).catch(() => {
        this.showAlert('danger', 'Your message could not be sent');
      });
      this.resetForm();
    } else {
      this.showAlert('warning', 'Please fill the form');
    };
  }1

  render() {
    return (
      <div>
        <div>
          <div>
            {this.state.alert && <div className={`alert alert-${this.state.alertData.type}`} role='alert'>
              <div className='container'>
                {this.state.alertData.message}
              </div>
            </div>}
            <div>
              <AuthUserContext.Consumer>
                {authUser => authUser && authUser.roles[ROLES.ADMIN]
                  && <Form
                    onSubmit={this.sendMessage.bind(this)}
                    introTitleRef={introTitle => this.inputIntroTitle = introTitle}
                    introLabelRef={introLabel => this.inputIntroLabel = introLabel}
                    introTextRef={introText => this.inputIntroText = introText}
                  />}
              </AuthUserContext.Consumer>

              <div>
                {this.state.form1.map(form =>
                  <div key={form.company}>
                    {form.introLabel}
                    {form.introText}
                  </div>)}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ReportIntro;