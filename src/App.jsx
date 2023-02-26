import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { customAxios } from "./utils";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputAdornment,
  Skeleton,
  TextField,
} from "@mui/material";
import {
  Close,
  Download,
  Instagram,
  Search,
  ThumbUp,
  Twitter,
} from "@mui/icons-material";

function App() {
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [open, setOpen] = useState(false);
  const isFirstRun = useRef(true);

  const getAllImages = async () => {
    try {
      const { data: images } = await customAxios.get("/photos");
      // console.log(images);
      setImages(images);
    } catch (error) {
      console.log(error);
    }
  };

  const getImage = async (id) => {
    try {
      const { data: image } = await customAxios.get("/photos/" + id);
      // console.log(image);
      setSelectedImage(image);
    } catch (error) {
      console.log(error);
    }
  };

  const searchImage = async (text = "") => {
    setLoading(true);
    try {
      const { data: images } = await customAxios.get("/search/photos", {
        params: {
          query: text,
        },
      });
      // console.log(images);
      setImages(images.results);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // debouce search
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!search) {
      getAllImages();
      return;
    }
    const timeout = setTimeout(() => {
      searchImage(search);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  // get all images on first load
  useEffect(() => {
    getAllImages();
  }, []);

  return (
    <div className="App">
      <div>
        <TextField
          fullWidth
          value={search}
          variant="outlined"
          placeholder="Search"
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    if (loading) return;
                    setSearch("");
                  }}
                  edge="end">
                  {loading ? <CircularProgress size={20} /> : <Close />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {search && <h2>{search}</h2>}
      </div>
      <Dialog
        fullWidth
        maxWidth="md"
        scroll="body"
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedImage(null);
        }}>
        {selectedImage ? (
          <DialogContent
            className="dialog-content"
            style={{
              background: `linear-gradient(180deg, ${selectedImage.color} 0%, rgba(26,26,26,1) 80%)`,
            }}>
            <img
              height={600}
              style={{
                maxWidth: 800,
                objectFit: "cover",
                // boxShadow: `0 0 150px 10px ${selectedImage.color}`,
              }}
              src={selectedImage.urls.regular}
              alt={selectedImage.alt_description}
              title={selectedImage.alt_description}
            />
            <span
              style={{
                fontSize: "x-small",
              }}>
              {selectedImage.description || selectedImage.alt_description}
            </span>
            <div className="head1">
              <div className="head1-left">
                <div className="user">
                  <img
                    className="pfp"
                    src={selectedImage.user.profile_image.medium}
                    alt={selectedImage.user.name}
                  />
                  <div>
                    <div>{selectedImage.user.name}</div>
                    <a href={selectedImage.user.links.html} target="_blank">
                      {selectedImage.user.username}
                    </a>
                  </div>
                </div>
                <div className="social">
                  {selectedImage.user.social.instagram_username && (
                    <div
                      className="social-link"
                      onClick={() => {
                        window.open(
                          `https://www.instagram.com/${selectedImage.user.social.instagram_username}`,
                          "_blank"
                        );
                      }}>
                      <Instagram fontSize="small" />
                      {selectedImage.user.social.instagram_username}
                    </div>
                  )}
                  {selectedImage.user.social.twitter_username && (
                    <div
                      className="social-link"
                      onClick={() => {
                        window.open(
                          `https://www.twitter.com/${selectedImage.user.social.twitter_username}`,
                          "_blank"
                        );
                      }}>
                      <Twitter fontSize="small" />
                      {selectedImage.user.social.twitter_username}
                    </div>
                  )}
                </div>
              </div>
              <div className="head1-right">
                <Button
                  variant="outlined"
                  onClick={() => {
                    window.open(selectedImage.links.download, "_blank");
                  }}>
                  Download
                </Button>
                <div className="info">
                  <div className="likes">
                    <Download fontSize="small" />
                    {selectedImage.downloads}
                  </div>
                  <div className="likes">
                    <ThumbUp fontSize="small" />
                    {selectedImage.likes}
                  </div>
                </div>
              </div>
            </div>
            <div className="head2">
              <span>Related tags</span>
              <div className="chips">
                {selectedImage.tags.map((tag) => (
                  <Chip key={tag.title} label={tag.title} />
                ))}
              </div>
            </div>
          </DialogContent>
        ) : (
          <Skeleton variant="rectangular" height={600} width="100%" />
        )}
      </Dialog>
      {images.length > 0 ? (
        <ImageList cols={3} rowHeight={230} variant="quilted">
          {images.map((image) => (
            <ImageListItem key={image.id}>
              <img
                onClick={() => {
                  setOpen(true);
                  getImage(image.id);
                }}
                className="thumb"
                src={image.urls.small}
                alt={image.alt_description}
                title={image.alt_description}
              />
              <ImageListItemBar
                style={{
                  textAlign: "left",
                }}
                position="bottom"
                title={image.user.first_name}
                subtitle={image.user.username}
                actionIcon={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginRight: 10,
                    }}>
                    <ThumbUp fontSize="small" />
                    {image.likes || 0}
                  </span>
                }
                actionPosition="right"
              />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <h3>No results found</h3>
      )}
    </div>
  );
}

export default App;
