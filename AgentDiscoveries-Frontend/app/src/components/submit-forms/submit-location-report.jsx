import * as React from 'react';
import {Button, Checkbox, ControlLabel, Form, FormControl, FormGroup} from 'react-bootstrap';
import {apiGet, apiPost} from '../utilities/request-helper';
import {Messages} from '../message';


export default class LocationReportSubmit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            locations: [],

            locationId: '',
            status: '',
            reportTitle: '',
            reportBody: '',
            sendExternal: false,

            messages: []
        };

        this.onLocationChange = this.onLocationChange.bind(this);
        this.onStatusChange = this.onStatusChange.bind(this);
        this.onReportBodyChange = this.onReportBodyChange.bind(this);
        this.onReportTitleChange = this.onReportTitleChange.bind(this);
        this.onExternalChange = this.onExternalChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount() {
        apiGet('locations')
            .then(results => this.setState({ locations: results }))
            .catch(() => this.addMessage('Error fetching locations, please try again later', 'danger'));
    }

    render() {
        return (
            <div className='col-md-8 col-md-offset-2'>
                <Form onSubmit={this.onSubmit}>
                    <h3>Submit Location Report</h3>

                    <Messages messages={this.state.messages}/>

                    <FormGroup>
                        <ControlLabel>Location</ControlLabel>
                        <FormControl componentClass='select' required
                            value={this.state.locationId}
                            onChange={this.onLocationChange}
                            id='location-select'>
                            <option value='' hidden>Choose a location</option>
                            {this.state.locations.map(location =>
                                <option key={location.locationId} value={location.locationId}>{location.location}, {location.siteName}</option>)}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Status</ControlLabel>
                        <FormControl type='number' required
                            placeholder='Enter numeric status code'
                            value={this.state.status}
                            onChange={this.onStatusChange}
                            id="status-input"/>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Title</ControlLabel>
                        <FormControl type='text' required
                            componentClass='textarea'
                            placeholder='Write title'
                            value={this.state.reportTitle}
                            onChange={this.onReportTitleChange}
                            id="title-input"/>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Report</ControlLabel>
                        <FormControl type='text' required
                            maxlength='30'
                            componentClass='textarea' rows={6}
                            placeholder='Write report'
                            value={this.state.reportBody}
                            onChange={this.onReportBodyChange}
                            id="report-input"/>
                    </FormGroup>
                    <FormGroup>
                        <Checkbox type='checkbox'
                            value={this.state.sendExternal}
                            onChange={this.onExternalChange}>
                            Send to external partner
                        </Checkbox>
                    </FormGroup>
                    <Button type='submit' id="submit-report">Submit</Button>
                </Form>
            </div>
        );
    }

    onLocationChange(event) {
        this.setState({ locationId: event.target.value && parseInt(event.target.value) });
    }

    onStatusChange(event) {
        this.setState({ status: event.target.value && parseInt(event.target.value) });
    }

    onReportBodyChange(event) {
        this.setState({ reportBody: event.target.value });
    }
    onReportTitleChange(event) {
        this.setState({ reportTitle: event.target.value});
    }

    onExternalChange(event) {
        this.setState({ sendExternal: event.target.checked });
    }

    onSubmit(event) {
        event.preventDefault();

        this.setState({ messages: [] });

        const body = {
            locationId: this.state.locationId,
            status: this.state.status,
            reportBody: this.state.reportBody,
            reportTitle: this.state.reportTitle,
            sendExternal: this.state.sendExternal
        };

        apiPost('reports/locationstatuses', body)
            .then(() => this.addMessage('Report submitted', 'info'))
            .catch(() => this.addMessage('Error submitting report, please try again later', 'danger'));

        if (this.state.sendExternal) {
            apiPost('external/reports', body)
                .then(() => this.addMessage('Report submitted to external partner', 'info'))
                .catch(() => this.addMessage('Error submitting report externally, please try again later', 'danger'));
        }
    }

    addMessage(message, type) {
        this.setState(oldState => {
            return { messages: [...oldState.messages, { message: message, type: type }] };
        });
    }
}
