import React from 'react';

class Thumbnail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        let currentThumb = document.getElementsByClassName('thumb-item active')[0];

        if (currentThumb) {
            currentThumb.classList.remove('active');
        }

        this.setState({
            active: true
        });
    }

    render() {
        return (
            <a href="#" onClick={this.handleClick} className={`thumb-item ${this.state.active ? 'active' : null}`}>
                <div className="thumb-wrapper">
                    <img className="thumb" src={this.props.src}/>
                    <span className="thumb-id">{this.props.id}</span>
                </div>
            </a>
        );
    }
}

export default Thumbnail;