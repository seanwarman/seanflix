import React, { Component } from 'react';
import API from '../libs/ixApi';
import { Button, Input, Drawer, Icon, Card, Row, Col } from 'antd';

export default class Seanflix extends Component {
  state = {
    form: {
      title: null,
      genre: null,
      magnet: null
    },
    drawerVisible: true,
    movieFiles: null,
    moviePics: null,
    currentMovie: null,
    loadingMovie: null,
    editCard: false
  };

  componentDidMount = async() => {
    // this.props.setLocation(this.props.location.pathname);
    let stateCopy = { ...this.state };

    stateCopy.movieFiles = await this.getMovies();
    // stateCopy.moviePics = await this.getMoviePics();

    // console.log('about to post');
    // TODO this endpoint needs error handling.
    // let response = await this.getInfo(stateCopy.movieFiles);
    // console.log('response: ', response);

    this.setState(stateCopy);
  }

  getInfo = async(movies) => {
    let result;
    let error;
    try {
      result = await API.post('/seanflix/wiki/info', this.prettifyFileName(movies[0]));
    } catch (err) {
      console.log(err);
      error = err;
    }
    if(error) return error;
    return result;
  }

  updateInfo = async() => {
    let result;
    try {
      result = await API.put('/seanflix/update');
    } catch (error) {
      console.log('There was an error updating the movie info: ', error);
    }
  }

  getMovies = async() => {
    let result;
    try {
      result = await API.get('/seanflix/list');
    } catch (err) {
      console.log(err);
    }
    console.log('Movies: ', result);
    return result;
  }

  handleFormInput = (key, value) => {
    console.log(key, value);
    let stateCopy = { ...this.state };
    stateCopy.form[key] = value;
    this.setState(stateCopy);
  }

  submitForm = () => {
    console.log('Submit...');
  }

  handleForm = (e, key) => {
    let stateCopy = { ...this.state };
    stateCopy.form[key] = e.target.value;
    this.setState(stateCopy);
  }

  handleSubmit = async() => {

    let stateCopy = { ...this.state };
    let result;
    try {
      result = await API.post('/seanflix/create', stateCopy.form.magnet);
    } catch (err) {
      console.log('There was an error posting to seanflix/create ', err);
    }
    console.log('seanflix create result: ', result);
  }

  prettifyFileName = (fileName) => {
    return fileName.replace(/.mp4/, '').replace(/_/g, ' ');
  }

  clearMovie = () => {
    this.setState({ currentMovie: null, loadingMovie: null });
  }

  lineUpMovie = (movie) => {
    this.setState({ currentMovie: null, loadingMovie: movie })
    setTimeout(() => this.setState({ currentMovie: movie, loadingMovie: null }), 1000);
  }
  
  renderEditCard = () => {

    const videoStyles = {
      width: '100%',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '25px'
    };

    const iconStyles = {
      opacity: 1,
      transition: 'all 1s',
      fontSize: '3rem',
      color:  '#e8e8e8',
      position: 'absolute'
    }

    return (
      <div 
        style={{
          cursor: 'pointer',
          position: 'relative' ,
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {
          // loading ?
          // <Icon style={iconStyles} type="loading" />
          // :
          // loaded ?
          // null
          // :
          // <Icon style={iconStyles} type="video-camera" />
        }
        <div 
          style={{ 
            transition: 'all 1s', 
            overflow: 'hidden', 
            background: 'black', 
            height: '100%', 
            position: 'absolute',
            width: '100%',
            display: 'flex'
            // alignItems: 'end'
          }}
        >
          <div
            style={{ 
              position: 'absolute',
              right: '16px',
              top: '10px',
              fontSize: '2rem',
              color: '#898989',
              zIndex: 1 
            }}
          >
            <Icon onClick={() => {
              let form = { title: null, genre: null }
              this.setState({ editCard: -1, form })
            }} 
            type="close" />
          </div>
          <div style={videoStyles}>
            <Input value={this.state.form.title} onChange={e => this.handleFormInput('title', e.target.value)} addonBefore="Title" />
            <Input value={this.state.form.genre} onChange={e => this.handleFormInput('genre', e.target.value)} addonBefore="Genre" />
            <Button onClick={this.submitForm}>Save</Button>
            <Button onClick={() => {
              let form = { title: null, genre: null }
              this.setState({ editCard: -1, form })
            }}>Cancel</Button>
          </div>
        </div>
      </div>
    )
  }

  renderMovie = (movie, loaded, loading) => {
    const { currentMovie } = this.state;

    const heightAnimation = () => (
      loaded ?
      '250px'
      :
      '0px'
    )
    
    const iconAnimation = () => (
      loaded ?
      '0'
      :
      '1'
    )

    const videoStyles = {
      width: '100%',
      backgroundColor: 'black',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const iconStyles = {
      opacity: iconAnimation(),
      transition: 'all 1s',
      fontSize: '3rem',
      color:  '#e8e8e8',
      position: 'absolute'
    }

    return (
      <div 
        onClick={() => (
          loaded ||
          this.lineUpMovie(movie)
        )}
        style={{
          cursor: 'pointer',
          position: 'relative' ,
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {
          loading ?
          <Icon style={iconStyles} type="loading" />
          :
          loaded ?
          null
          :
          <Icon style={iconStyles} type="video-camera" />
          
        }
        <div 
          style={{ 
            transition: 'all 1s', 
            overflow: 'hidden', 
            background: 'black', 
            height: heightAnimation(), 
            position: 'absolute',
            width: '100%',
            display: 'flex'
            // alignItems: 'end'
          }}
        >
          <div
            onClick={this.clearMovie}
            style={{ 
              position: 'absolute',
              right: '16px',
              top: '10px',
              fontSize: '2rem',
              color: 'white',
              zIndex: 1 
            }}
          >
            <Icon type="close" />
          </div>
          {
            currentMovie &&
            <video style={videoStyles} controls>
              <source src={'/movies/' + currentMovie} type='video/mp4'></source>
            </video>
          }
        </div>
      </div>
      )
    }

  render() {

    const { movieFiles, currentMovie, loadingMovie } = this.state;

    const iconStyles = {
      fontSize: '1.5rem'
    };
    
    return (
      <div>
        {
          <Drawer 
            width={500}
            placement="right"
            visible={this.props.drawerVisible}
            closable={false}
            onClose={this.props.closeDrawer}
          >
            <Input value={this.state.form.magnet} addonBefore="Magnet Url" />
          </Drawer>
        }
        {
          !movieFiles ?
            <div style={{ width: '100%', height: '75vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Icon style={{ color: 'white', fontSize: '5rem' }} type="loading" />
            </div>
            :
            <div>
              <h1 style={{ color: '#c53942', textAlign: 'center' }}>SEANFLIX</h1>
              <Row gutter={16}>
                  { /*<Col 
                    span={24} sm={12} md={8}
                    style={{ marginBottom: '16px' }}
                  >
                    <Card
                      bordered={false}
                      headStyle={{ border: 'none' }}
                      bodyStyle={{ padding: 0 }}
                      title={
                        <h3 style={{ marginBottom: 0, color: '#e3e3e3' }}>New Movie</h3>
                      }
                          actions={[
                            <Icon 
                              style={iconStyles} 
                              type="download" 
                              onClick={this.handleSubmit}
                            /> 
                          ]}
                              cover={
                                <div style={{
                                  height: '250px',
                                  position: 'relative'
                                }}>
                                <div style={{
                                  width: '100%',
                                  padding: '0 2rem',
                                  position: 'absolute',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  top: '24px',
                                  height: '158px'
                                }}>
                                <div>
                                  <div>Magnet URL</div>
                                  <Input.TextArea 
                                    autosize={{
                                      minRows: 4,
                                      maxRows: 4
                                    }}
                                    value={this.state.form.magnet} 
                                    onChange={this.handleForm}
                                  />
                                  </div>
                                </div>
                              </div>
                              }
                              >
                              </Card>
                              </Col>*/ }
                {
                  movieFiles &&
                  movieFiles.map((movie, index) => (
                    <Col 
                      key={movie.id} 
                      span={24} sm={12} md={8}
                      style={{ marginBottom: '16px' }}
                    >
                      <Card
                        bordered={false}
                        style={{ background: '#2c2c2c', color: '#e3e3e3' }}
                        headStyle={{ border: 'none' }}
                        bodyStyle={{ padding: 0 }}
                        title={
                          <h3 style={{ marginBottom: 0, color: '#e3e3e3' }}>{movie.title}</h3>
                        }
                        // hoverable={true}
                        actions={[
                          <Icon style={iconStyles} type="star" />, 
                          <Icon onClick={() => {
                            if(this.state.editCard === index) {
                              this.setState({ editCard: -1 })
                            } else {
                              this.setState({ editCard: index })
                            }
                            
                          }}
                          style={iconStyles} type="bars" />,
                        ]}
                        cover={
                          <div style={{
                            height: '250px',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            {
                              this.state.editCard === index ?
                              this.renderEditCard()
                              :
                              this.renderMovie(movie.filename, (movie.filename === currentMovie), (movie.filename === loadingMovie))
                            }
                          </div>
                        }
                      >
                      </Card>
                    </Col>
                  ))
                }
              </Row>
            </div>
        }
      </div>
    );
  }
}
