import React  from 'react';
import ReactDOM from 'react-dom';
import Loading from './loading'
import LoadFile from './load-file';
import Toolbar from './toolbar';
import Thumbnail from './thumbnail';
import MainImage from './main-image';

const {ipcRenderer} = window.require('electron');
const Config = window.require('electron-config');
const config = new Config();

class Main extends React.Component {
    constructor() {
        super();
        this.last_image = config.get('last_image') || 0;
        this.active_image = config.get('last_image') || 0;

        this.state = {
            loading: false,
            fullscreen: false,
            file: false,
            images_count: 0,
            images_list: []
        };

        this.toggleFullScreen = this.toggleFullScreen.bind(this);
        this.bindEvents = this.bindEvents.bind(this);

        this.bindEvents();
    }

    toggleFullScreen(state) {
        this.setState({
            fullscreen: state
        });
    }

    openConfig() {
        ipcRenderer.send('open-config', true);
    }

    bindEvents() {
        ipcRenderer.on('toggle-full-screen', (event, state) => {
            this.toggleFullScreen(state);
        });

        ipcRenderer.on('extract-started', (event, data) => {
            this.setState({
                loading: true
            });
        });

        ipcRenderer.on('extract-finished', (event, data) => {
            this.setState({
                loading: false,
                file: data.file,
                images_count: data.images_count
            });
        });

        ipcRenderer.on('item-added', (event, data) => {
            this.state.images_list.push(data);
        });
    }

    render() {
        return (
            <div id="shoujo" className={this.state.fullscreen ? "fullscreen" : ""}>
                {this.state.loading && <Loading/>}
                {!this.state.file && <LoadFile/>}
                <Toolbar
                    count={this.state.images_count}
                />
                <div id="thumbnails">
                    {this.state.images_list.map((image) => {
                        return <Thumbnail
                            id={image.id + 1}
                            src={image.path}
                        />;
                    })}
                </div>
                <MainImage />
            </div>
        );
    }
}

ReactDOM.render(<Main />,
    document.getElementById('shoujo')
);