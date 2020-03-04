import React, { Component } from 'react';

import Radar from 'react-d3-radar';

import app from 'firebase/app';
import * as ROLES from '../../constants/roles';
import { AuthUserContext } from '../Session';
import { withFirebase } from '../Firebase';
//import ReportIntro from './reportIntro';

/* const Form = React.forwardRef((onSubmit, companyRef, assetsToolingRef, designLanguageRef, codeArchitectureRef, productImplementationRef, campaigningRef) => (
  <div>
    <h2>Company Form</h2>
    <form onSubmit={onSubmit} ref={companyRef}>
      <div>
        <label htmlFor='company'>Company</label>
        <input type='text' id='company' placeholder='company' ref={companyRef} />
      </div>
      <div>
        <label htmlFor='assetsTooling'>Assets &amp; Tooling</label>
        <input type='text' id='assetsTooling' placeholder='Score' ref={assetsToolingRef} />
      </div>
      <div>
        <label htmlFor='designLanguage'>Design language</label>
        <input type='text' id='designLanguage' placeholder='Score' ref={designLanguageRef} />
      </div>
      <div>
        <label htmlFor='codeArchitecture'>Code Architecture</label>
        <input type='text' id='codeArchitecture' placeholder='Score' ref={codeArchitectureRef} />
      </div>
      <div>
        <label htmlFor='productImplementation'>Product Implementation</label>
        <input type='text' id='productImplementation' placeholder='Score' ref={productImplementationRef} />
      </div>
      <div>
        <label htmlFor='campaigning'>Campaigning</label>
        <input type='text' id='campaigning' placeholder='Score' ref={campaigningRef} />
      </div> 

      <button type='submit' >Send</button>
    </form>
  </div>
));
 */
class Report  extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: [],
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
    let formRef = this.db.ref('form').orderByKey().limitToLast(6);
    formRef.on('child_added', snapshot => {
      const formId = this.db.ref("form").push().key
      const { name, assetsTooling, designLanguage, codeArchitecture, productImplementation, campaigning} = snapshot.val();
      const data = { name, assetsTooling, designLanguage, codeArchitecture, productImplementation, campaigning, formId};
      this.setState({ form: [data].concat(this.state.form) });
      
    })
  }

  sendMessage(e) {
    e.preventDefault();
    
    const params = {
      name: this.inputCompany.value,
      assetsTooling: this.inputAssetsTooling.value,
      designLanguage: this.inputDesignLanguage.value,
      codeArchitecture: this.inputCodeArchitecture.value,
      productImplementation: this.inputProductImplementation.value,
      campaigning: this.inputCampaigning.value,
    };
    console.log(params, this.inputCompany)
    if (params.name && params.assetsTooling && params.designLanguage && params.codeArchitecture && params.productImplementation && params.campaigning) {
      this.db.ref('form').push(params).then(() => {
        this.showAlert('success', 'Your message was sent successfull');
      }).catch(() => {
        this.showAlert('danger', 'Your message could not be sent');
      });
      this.resetForm();
    } else {
      this.showAlert('warning', 'Please fill the form');
    };
  }

  onRemoveGraph(formId, e) {
    console.log(formId)
    this.props.firebase.form(formId).remove()
  };

  render() {
    return (
      <div>
        {/* <ReportIntro /> */}
        <div>
        {this.state.alert && <div className={`alert alert-${this.state.alertData.type}`} role='alert'>
          <div className='container'>
            {this.state.alertData.message}
          </div>
        </div>}
        <div>
          <div>
              <AuthUserContext.Consumer>
                {authUser => authUser && authUser.roles[ROLES.ADMIN]
                  && 
              <div>
                <h2>Company Form</h2>
                <form onSubmit={this.sendMessage.bind(this)} contactForm={company => this.inputCompany = company}>
                  <div>
                    <label htmlFor='name'>Company</label>
                    <input type='text' id='name' placeholder='company' ref={company => this.inputCompany = company} />
                  </div>
                  <div>
                    <label htmlFor='assetsTooling'>Assets &amp; Tooling</label>
                    <input type='text' id='assetsTooling' placeholder='Score' ref={assetsTooling => this.inputAssetsTooling = assetsTooling} />
                  </div>
                  <div>
                    <label htmlFor='designLanguage'>Design language</label>
                    <input type='text' id='designLanguage' placeholder='Score' ref={designLanguage => this.inputDesignLanguage = designLanguage} />
                  </div>
                  <div>
                    <label htmlFor='codeArchitecture'>Code Architecture</label>
                    <input type='text' id='codeArchitecture' placeholder='Score' ref={codeArchitecture => this.inputCodeArchitecture = codeArchitecture} />
                  </div>
                  <div>
                    <label htmlFor='productImplementation'>Product Implementation</label>
                    <input type='text' id='productImplementation' placeholder='Score' ref={productImplementation => this.inputProductImplementation = productImplementation} />
                  </div>
                  <div>
                    <label htmlFor='campaigning'>Campaigning</label>
                    <input type='text' id='campaigning' placeholder='Score' ref={campaigning => this.inputCampaigning = campaigning} />
                  </div>

                  <button type='submit' >Send</button>
                </form>
                  </div>}
              </AuthUserContext.Consumer>
             
              <div>
                {this.state.form.map((form, index) =>
                  <div key={`${form.company}${index}`}>
                      <Radar
                        width={400}
                        height={400}
                        padding={70}
                        domainMax={1}
                        highlighted={null}
                        onHover={(point) => {
                          if (point) {
                            console.log('hovered over a data point');
                          } else {
                            console.log('not over anything');
                          }
                        }}
                        data={{
                          variables: [
                            { key: 'assetsTooling', label: 'Assets & Tooling' },
                            { key: 'designLanguage', label: 'Design Language' },
                            { key: 'codeArchitecture', label: 'Code Architecture' },
                            { key: 'productImplementation', label: 'Product Implementation' },
                            { key: 'campaigning', label: 'Campaigning' },
                          ],
                          sets: [
                            {
                              key: 'company',
                              label: form.company,
                              values: {
                                assetsTooling: form.assetsTooling,
                                designLanguage: form.designLanguage,
                                codeArchitecture: form.codeArchitecture,
                                productImplementation: form.productImplementation,
                                campaigning: form.campaigning,
                              },
                            },
                          ],
                        }}
                      />
                    <button
                      type="button"
                      onClick={this.onRemoveGraph.bind(this, form.formId)}
                    >
                      Delete
                    </button>
                  </div>)}
                </div>
              <div>
                <div>
                  <h1>How the Diagnostic Works</h1>
                  <p>Through a combination of interviews, surveys, and just getting under the hood to see what’s what, we scored Helix across 8 different criteria to assign a score and a series of recommendations for how to take Helix to the next level.</p>
                </div>
                <div>
                  <ul>
                    <li>
                      <h2>Organizational Involvement</h2>
                      <p>How much buy-in do you have across the company?</p>
                    </li>
                    <li>
                      <h2>Assets & Tooling</h2>
                      <p>Do you have the right tools and configurations to be successful?</p>
                    </li>
                    <li>
                      <h2>Design Language</h2>
                      <p>How much rigidity and flexibility is built into the art direction and design language?</p>
                    </li>
                    <li>
                      <h2>Code Architecture</h2>
                      <p>How systems-minded is the code for the design system?</p>
                    </li>
                    <li>
                      <h2>Team Workflow</h2>
                      <p>Are your teams and processes set up to reap the most benefits from having a design system?</p>
                    </li>
                    <li>
                      <h2>Product Implementation</h2>
                      <p>How well does your design system power user-facing products?</p>
                    </li>
                    <li>
                      <h2>Campaigning</h2>
                      <p>How well are you constantly and consistently selling your design system and its benefits internally?</p>
                    </li>
                    <li>
                      <h2>Maintenance & Governance</h2>
                      <p>Are you treating your design system like a fully-fledged product?</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withFirebase(Report);