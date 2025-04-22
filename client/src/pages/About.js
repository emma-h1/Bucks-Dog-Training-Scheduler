import { Container } from "react-bootstrap";
import OurTeam from "./OurTeam";

export default function About() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="page-header">About</h1>
            {/* Rectangle container with padding to ensure it doesn't touch the sides */}
            <Container className="about-section text-center">
                {/* Background Layer */}
                <div className="background-image"></div>

                <div className="about-text">
                    <h3 className="page-subheader">
                    Welcome to Buck's Dog Training of Central NJ, where our mission is to bring out the best in your four-legged friends.
                    </h3>
                    <h3 className="page-subheader">
                    Led by Lauraine Wright, our team is dedicated to improving the lives of dogs and their owners through effective, individualized training techniques.
                    </h3>
                </div>
            </Container>

            <div className="our-team-bg">
            <OurTeam />
            </div>
        </div>

    )
}

