import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../../redux/loaderSlice";
import { getShowById } from "../../apicalls/shows";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Row, Col, Button } from "antd";
import moment from "moment";

const BookShow = () => {
  // Redux state and hooks
  const { user } = useSelector((state) => state.user); // Extracting user from Redux state
  const dispatch = useDispatch(); // Redux dispatch function
  const [show, setShow] = useState(); // State for holding show details
  const [selectedSeats, setSelectedSeats] = useState([]); // State for managing selected seats
  const params = useParams(); // Extracting URL parameters
  const navigate = useNavigate(); // Navigation hook

  // Function to fetch show data by ID
  const getData = async () => {
    try {
      dispatch(showLoading()); // Dispatching action to show loading state
      const response = await getShowById(params.showId); // API call to fetch show details
      if (response.success) {
        setShow(response.data); // Setting state with fetched show data
        // message.success(response.message); // Optional success message
        console.log(response.data); // Logging show data to console
      } else {
        message.error(response.message); // Displaying error message if API call fails
      }
      dispatch(hideLoading()); // Dispatching action to hide loading state
    } catch (err) {
      message.error(err.message); // Handling errors from API call
      dispatch(hideLoading()); // Hiding loading state on error
    }
  };

  // Function to generate seat layout dynamically
  const getSeats = () => {
    let columns = 12; // Number of columns for seating arrangement
    let totalSeats = 120; // Total number of seats
    let rows = totalSeats / columns; // Calculating number of rows

    return (
      <div className="d-flex flex-column align-items-center">
        <div>
          <div className="w-100 max-width-600 mx-auto mb-25px">
            <p className="text-center mb-10px">
              Screen this side, you will be watching in this direction
            </p>
            <div className="screen-div">
              {/* Placeholder for screen display */}
            </div>
          </div>
          <ul className="seat-ul justify-content-center">
            {Array.from(Array(rows).keys()).map((row) =>
              // Mapping rows
              Array.from(Array(columns).keys()).map((column) => {
                let seatNumber = row * columns + column + 1; // Calculating seat number

                let seatClass = "seat-btn"; // Default class for seat button
                if (selectedSeats.includes(seatNumber)) {
                  seatClass += " selected"; // Adding 'selected' class if seat is selected
                }
                if (show.bookedSeats.includes(seatNumber)) {
                  seatClass += " booked"; // Adding 'booked' class if seat is already booked
                }
                if (seatNumber <= totalSeats) {
                  // Rendering seat button if seat number is valid
                  return (
                    <li key={seatNumber}>
                      {/* Key added for React list rendering optimization */}
                      <button
                        style={{ color: "black" }}
                        className={seatClass}
                        onClick={() => {
                          // Function to handle seat selection/deselection
                          if (selectedSeats.includes(seatNumber)) {
                            setSelectedSeats(
                              selectedSeats.filter(
                                (curSeatNumber) => curSeatNumber !== seatNumber
                              )
                            );
                          } else {
                            setSelectedSeats([...selectedSeats, seatNumber]);
                          }
                        }}
                      >
                        {seatNumber}
                      </button>
                    </li>
                  );
                }
              })
            )}
          </ul>
        </div>

        <div className="d-flex bottom-card justify-content-between w-100 max-width-600 mx-auto mb-25px mt-3">
          <div className="flex-1">
            Selected Seats: <span>{selectedSeats.join(", ")}</span>
          </div>
          <div className="flex-shrink-0 ms-3">
            Total Price:{" "}
            <span>Rs. {selectedSeats.length * show.ticketPrice}</span>
          </div>
        </div>
      </div>
    );
  };

  // Effect hook to fetch data on component mount
  useEffect(() => {
    getData();
  }, []);

  // JSX rendering
  return (
    <>
      {show && (
        <Row gutter={24}>
          <Col span={24}>
            <Card
              title={
                <div className="movie-title-details">
                  <h1>{show.movie.title}</h1>
                  <p>
                    Theatre: {show.theatre.name}, {show.theatre.address}
                  </p>
                </div>
              }
              extra={
                <div className="show-name py-3">
                  <h3>
                    <span>Show Name:</span> {show.name}
                  </h3>
                  <h3>
                    <span>Date & Time: </span>
                    {moment(show.date).format("MMM Do YYYY")} at{" "}
                    {moment(show.time, "HH:mm").format("hh:mm A")}
                  </h3>
                  <h3>
                    <span>Ticket Price:</span> Rs. {show.ticketPrice}/-
                  </h3>
                  <h3>
                    <span>Total Seats:</span> {show.totalSeats}
                    <span> &nbsp;|&nbsp; Available Seats:</span>{" "}
                    {show.totalSeats - show.bookedSeats.length}
                  </h3>
                </div>
              }
              style={{ width: "100%" }}
            >
              {getSeats()} {/* Rendering dynamic seat layout */}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default BookShow;
