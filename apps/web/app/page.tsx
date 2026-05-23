"use client";
import { Card, CardContent, Container, Typography } from "@mui/material";
import Ant from "../components/Ant";
// import Chakra from "components/Chakra";
// import Mantine from "components/Mantine";
// import Array from "components/Array";
// import Basics from "../components/Basics";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Card className="shadow-navy-md card-hover">
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              className="text-gradient-alecia font-serif"
            >
              Auto Form demo
            </Typography>
            {/* <Basics /> */}
            {/* <Array /> */}
            {/* <Mantine /> */}
            {/* <Shadcn /> */}
            <Ant />
            {/* <Chakra  /> */}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
