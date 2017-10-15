import React  from 'react';
const {ipcRenderer} = window.require('electron');

class LoadFile extends React.Component {
    openFile() {
        ipcRenderer.send('open-file', true);
    }

    render() {
        return (
            <div id="openFile">
                <a href="#"
                   className="link"
                   onClick={this.openFile}>Open File</a>
            </div>
        );
    }
}

export default LoadFile;