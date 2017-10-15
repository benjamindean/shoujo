import React  from 'react';

class MainImage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="image-container">
                <img onClick={this.onClickImage}
                     className="page-image fit-width"
                     id="mainImage"
                     src={this.props.source}/>
            </div>
        );
    }
}

export default MainImage;