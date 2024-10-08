import React, { useState } from 'react';
import { useCartContext } from '../context/CartContext';
import { Button, Table, Form, FormControl } from 'react-bootstrap';
import { db } from '../main';
import { collection, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, calculateTotal, clearCart, updateItemQuantity, removeItem } = useCartContext();

  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    phone: ''
  });


  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setBuyerData({
      ...buyerData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuantityChange = (id, e) => {
    const newQuantity = e.target.value;
    updateItemQuantity(id, newQuantity);
  };

  const handleCheckout = async () => {
    if (buyerData.email !== buyerData.confirmEmail) {
      setMessage('Los correos electrónicos no coinciden.');
      return;
    }

    if (!buyerData.name || !buyerData.email || !buyerData.phone) {
      setMessage('Por favor, completa todos los campos del comprador.');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);

    const total = calculateTotal();

    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        buyer: buyerData,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total,
        date: new Date(),
        status: 'generada'
      });
      console.log('Orden creada con ID: ', docRef.id);
      setMessage('¡Gracias por tu compra! Tu ID de orden es: ' + docRef.id);
      clearCart();
      setIsOrderCompleted(true);
    } catch (error) {
      console.error('Error al crear la orden: ', error);
      setMessage('Hubo un error al crear la orden.');
    }

    setIsProcessing(false);
  };

  return (
    <div>
      <h1>Carrito de Compras</h1>

      {}
      {isOrderCompleted ? (
        <div>
          <p>{message}</p>
          <Link to="/">
            <Button variant="primary">Volver al Inicio</Button>
          </Link>
        </div>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <p>El carrito está vacío</p>
          ) : (
            <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <FormControl
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                        />
                      </td>
                      <td>${item.price}</td>
                      <td>${item.price * item.quantity}</td>
                      <td>
                        <Button variant="danger" onClick={() => removeItem(item.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <h3>Total: ${calculateTotal()}</h3>

              {}
              <Form>
                <Form.Group className="mb-3" controlId="buyerName">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    name="name"
                    value={buyerData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="buyerEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu email"
                    name="email"
                    value={buyerData.email}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="buyerConfirmEmail">
                  <Form.Label>Confirmar Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Repite tu email"
                    name="confirmEmail"
                    value={buyerData.confirmEmail}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="buyerPhone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu número de teléfono"
                    name="phone"
                    value={buyerData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Form>

              {}
              <Button variant="success" onClick={handleCheckout} disabled={isProcessing}>
                {isProcessing ? 'Procesando...' : 'Finalizar Compra'}
              </Button>

              {}
              {message && <p>{message}</p>}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;


