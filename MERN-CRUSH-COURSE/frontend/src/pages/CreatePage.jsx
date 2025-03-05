import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useColorModeValue } from "./../components/ui/color-mode";
import { useProductstore } from "../../store/product";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });

  const { createProduct } = useProductstore();
  const handleAddProduct = async () => {
    const { success, message } = await createProduct(newProduct);
    if (!success) {
      toast.error(message, { position: "top-center", autoClose: 5000 });
    } else {
      toast.success(message, { position: "top-center", autoClose: 5000 });
    }
  };

  return (
    <Container maxW={"4/6"}>
      <VStack wordSpacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
          Create New Product
        </Heading>

        <Box
          w={"full"}
          bg={useColorModeValue("red.200", "gray.800")}
          p={6}
          rounded={"lg"}
          shadow={"md"}
        >
          <VStack wordSpacing={4}>
            <Input
              type="text"
              placeholder="Product Name"
              name="name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Product Price"
              name="price"
              value={newProduct.price}
              m={4}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />

            <Input
              placeholder="Product Image URL"
              name="Image"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />

            <Button colorPalette="teal" w={"1/2"} onClick={handleAddProduct}>
              Add Product
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;
