import {
  Box,
  Heading,
  HStack,
  IconButton,
  Image,
  Text,
  Button,
  Input,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { useColorModeValue } from "./ui/color-mode";
import { useProductstore } from "../../store/product";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

// Set app root for accessibility
Modal.setAppElement("#root");

const ProductCard = ({ product }) => {
  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("red.300", "gray.900");
  const { deleteProduct, updateProduct } = useProductstore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState(product);

  const handleDeleteProduct = async (pid) => {
    setIsDeleteModalOpen(false);
    const { success, message } = await deleteProduct(pid);
    if (!success) {
      toast.error(message, { position: "bottom-center", autoClose: 3000 });
    } else {
      toast.success(message, { position: "bottom-center", autoClose: 3000 });
    }
  };

  const handleEditProduct = async (pid, updatedproduct) => {
    setIsEditModalOpen(false);
    // Here, you should call your update function in useProductstore
    const { success, message } = await updateProduct(pid, updatedproduct);

    if (!success) {
      toast.error(message, { position: "bottom-center", autoClose: 3000 });
    } else {
      toast.success(message, { position: "bottom-center", autoClose: 3000 });
    }
  };

  return (
    <Box
      shadow={"lg"}
      rounded={"lg"}
      overflow={"hidden"}
      transition={"all 0.3s"}
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
      bg={bg}
    >
      <Image
        src={product.image}
        alt={product.name}
        h={48}
        w="full"
        objectFit="cover"
      />
      <Box p={4}>
        <Heading as={"h3"} size={"md"} mb={2}>
          {product.name}
        </Heading>
        <Text fontWeight={"bold"} fontSize={"xl"} color={textColor} mb={4}>
          ${product.price}
        </Text>
        <HStack spacing={2}>
          <IconButton
            colorPalette={"blue"}
            rounded={"lg"}
            onClick={() => setIsEditModalOpen(true)}
          >
            <FaEdit />
          </IconButton>
          <IconButton
            colorPalette={"red"}
            rounded={"lg"}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <MdDelete />
          </IconButton>
        </HStack>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Confirm Delete"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            width: "30%",
            height: "20%",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          },
        }}
      >
        <Heading>Are you sure?</Heading>
        <p>
          Do you really want to delete <strong>{product.name}</strong>?
        </p>
        <HStack spacing={4} justify="center" mt={4}>
          <Button
            colorScheme="red"
            onClick={() => handleDeleteProduct(product._id)}
          >
            Yes, Delete
          </Button>
          <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
        </HStack>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit Product"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            width: "50%",
            height: "40%",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          },
        }}
      >
        <Heading>Edit Product</Heading>
        <VStack spacing={4} mt={4}>
          <Input
            placeholder="Product Name"
            name="name"
            value={updatedProduct.name}
            onChange={(e) =>
              setUpdatedProduct({ ...updatedProduct, name: e.target.value })
            }
          />
          <Input
            placeholder="Price"
            name="price"
            type="number"
            value={updatedProduct.price}
            onChange={(e) =>
              setUpdatedProduct({ ...updatedProduct, price: e.target.value })
            }
          />
          <Input
            placeholder="Image URL"
            name="image"
            value={updatedProduct.image}
            onChange={(e) =>
              setUpdatedProduct({ ...updatedProduct, image: e.target.value })
            }
          />
          <HStack spacing={4} justify="center" mt={4}>
            <Button
              colorScheme="blue"
              onClick={() => handleEditProduct(product._id, updatedProduct)}
            >
              Save Changes
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </HStack>
        </VStack>
      </Modal>
    </Box>
  );
};

export default ProductCard;
